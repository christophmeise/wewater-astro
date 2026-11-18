/**
 * One-off WordPress -> repo migration (phase 2). Re-runnable until cutover, then delete it.
 *
 *   npm run migrate:wp                 fetch WordPress, convert, write files
 *   npm run migrate:wp -- --offline    reuse the last GraphQL responses (scripts/migrate-wp/.cache)
 *   npm run migrate:wp -- --force-media  re-encode images and videos
 *
 * Writes (and owns, see lib/config.ts):
 *   src/content/{blog,projects}/<lang>/<slug>.mdx, src/content/team/<slug>.md,
 *   src/content/faq/<lang>/<nn>-<slug>.md, src/content/press/<lang>.md,
 *   src/assets/{wp,team,authors}/, public/docs/, public/media/,
 *   src/data/{categories,authors,docs}.ts, public/_redirects
 *
 * Media files already downloaded by the old Gatsby site are reused (see gatsbyCacheDir()).
 */
import path from 'node:path';
import { existsSync } from 'node:fs';
import { LANGS, ROOT, generatedDirs, gatsbyCacheDir, paths, type Lang } from './lib/config.ts';
import { fetchWordPress, type WpPost, type WpTeamMember } from './lib/wp.ts';
import { Media, dirSize, fetchCached } from './lib/media.ts';
import { Categories, type CategoryDef } from './lib/categories.ts';
import { SiteIndex, contentUrl, localize, rewriteHref, type ContentRef } from './lib/links.ts';
import { htmlToMdx, importLines } from './lib/html-to-mdx.ts';
import { decodeEntities, excerptText, htmlToText, truncate } from './lib/text.ts';
import { frontmatter, markWritten, removeStale, writeFile } from './lib/write.ts';
import { allWarnings, printWarnings, warn } from './lib/log.ts';

const HARDCODED_DOCS: Record<string, { url: string; note: string }> = {
  satzung: { url: 'https://www.wewaterbackend.org/wp-content/uploads/2026/11/Satzung_WeWater_2026.pdf', note: 'Satzung (statutes), Spenden widget' },
  zuwendungsbestaetigung: {
    url: 'https://www.wewaterbackend.org/wp-content/uploads/2026/11/Bestaetigung_ueber_Zuwendungen_fuer_Finanzamt_WeWater_11_26.pdf',
    note: 'Zuwendungsbestätigung for the tax office, Spenden widget',
  },
  bcsZertifikat: { url: 'https://wewaterbackend.org/wp-content/uploads/2019/09/WW09232019-BCS-1909302-303p.pdf', note: 'BCS lab certificate (99.9999 %), filter system pages' },
  aqqabagAnleitungDe: { url: 'https://wewaterbackend.org/wp-content/uploads/2019/09/anleitung_aqqabag.pdf', note: 'AQQAbag manual (German)' },
  aqqabagInstructionsEn: { url: 'https://wewaterbackend.org/wp-content/uploads/2019/09/aqqabag_instructions.pdf', note: 'AQQAbag manual (English)' },
  aqqacubeReinigungDe: { url: 'https://wewaterbackend.org/wp-content/uploads/2020/03/reinigung_aqqacube_DE.pdf', note: 'AQQAcube cleaning manual (German)' },
  aqqacubeDisinfectionEn: { url: 'https://wewaterbackend.org/wp-content/uploads/2020/03/disinfection_aqqacube_EN.pdf', note: 'AQQAcube disinfection manual (English)' },
  aqqacubePartikel: { url: 'https://wewaterbackend.org/wp-content/uploads/2021/01/AQQAcube_Partikel.pdf', note: 'Which dirty water the AQQAcube handles, AQQAcube page' },
};

/** WordPress author slug -> team member slug (for portraits and translated bios). */
const AUTHOR_TEAM: Record<string, string> = {
  thilo: 'thilo-kunz',
  steven: 'steven-hille',
  gina: 'gina-hartmann',
  'josi-lins': 'josephine-lins',
  'christoph-meise': 'christoph-meise',
  hannes: 'hannes-schwessinger',
};

/** Broken team links in WordPress. */
const TEAM_LINK_FIXES: Record<string, string> = {
  'https://wewater.org/team/instagram.com/virtually_thilo': 'https://www.instagram.com/virtually_thilo/',
};

const GENERIC_CATEGORIES = new Set(['allgemein', 'projekte']);

interface OutFile {
  path: string;
  content: string;
}

function lang(node: { language: { slug: string } | null }, where: string): Lang {
  const l = node.language?.slug;
  if (l === 'de' || l === 'en' || l === 'fr') return l;
  warn('content', `${where}: no language, treated as German`);
  return 'de';
}

function relFrom(fromDir: string, assetRel: string): string {
  const r = path.relative(fromDir, path.join(ROOT, 'src/assets', assetRel)).split(path.sep).join('/');
  return r.startsWith('.') ? r : `./${r}`;
}

/** ISO date in UTC. WordPress gives dateGmt; when it is missing, `date` is Berlin local time. */
function isoGmt(dateGmt: string | null | undefined, dateLocal?: string): string {
  if (dateGmt) {
    const iso = dateGmt.trim().replace(' ', 'T');
    return iso.endsWith('Z') ? iso : `${iso}Z`;
  }
  if (!dateLocal) throw new Error('missing date');
  const asUtc = new Date(`${dateLocal}Z`);
  const berlin = new Date(asUtc.toLocaleString('en-US', { timeZone: 'Europe/Berlin' }));
  const utc = new Date(asUtc.toLocaleString('en-US', { timeZone: 'UTC' }));
  return new Date(asUtc.getTime() - (berlin.getTime() - utc.getTime())).toISOString().replace('.000Z', 'Z');
}

function slugify(s: string, max = 60): string {
  const out = s
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/ß/g, 'ss')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  return out.slice(0, max).replace(/-[^-]*$/, (m) => (out.length > max ? '' : m)).replace(/-$/, '');
}

/** "[:de]Deutsch[:en]English[:]" (qTranslate) -> { de, en } */
function parseQtranslate(s: string | null | undefined): Partial<Record<Lang, string>> {
  if (!s) return {};
  if (!s.includes('[:')) return { de: decodeEntities(s).trim() };
  const out: Partial<Record<Lang, string>> = {};
  for (const m of s.matchAll(/\[:(de|en|fr)\]([\s\S]*?)(?=\[:)/g)) {
    const l = m[1] as Lang;
    out[l] = decodeEntities(m[2] ?? '').trim();
  }
  return out;
}

async function main() {
  console.log('Fetching WordPress…');
  const wp = await fetchWordPress();
  console.log(
    `  ${wp.posts.length} posts, ${wp.projects.length} projects, ${wp.team.length} team members, ${wp.categories.length} categories, ${wp.pages.length} pages, ${wp.media.length} media items`,
  );

  const gatsbyDir = gatsbyCacheDir();
  console.log(gatsbyDir ? `Using Gatsby media cache: ${gatsbyDir}` : 'No Gatsby media cache found: downloading all media');
  const media = new Media(wp.media, gatsbyDir);
  const categories = new Categories(wp.categories);
  const site = new SiteIndex();

  // ---------------------------------------------------------------------------
  // Index posts and projects (translation groups -> translationKey)
  // ---------------------------------------------------------------------------
  const refOf = new Map<WpPost, ContentRef>();
  for (const [kind, list] of [['post', wp.posts], ['project', wp.projects]] as const) {
    const bySlug = new Map(list.map((n) => [n.slug, n]));
    for (const node of list) {
      const members = [node, ...(node.translations ?? []).map((t) => bySlug.get(t.slug)).filter((n): n is WpPost => Boolean(n))];
      const keyNode = members.find((m) => m.language?.slug === 'de') ?? members.find((m) => m.language?.slug === 'en') ?? node;
      const ref: ContentRef = { kind, slug: node.slug, lang: lang(node, `${kind} ${node.slug}`), translationKey: keyNode.slug, wpId: node.databaseId };
      refOf.set(node, ref);
      site.add(ref);
    }
  }

  // Category usage by posts per language (for the projects' related-posts category).
  const postCategoryCount = new Map<string, number>();
  for (const p of wp.posts) {
    const l = refOf.get(p)?.lang ?? 'de';
    for (const key of new Set(p.categories.nodes.map((c) => categories.key(c.databaseId)))) {
      if (key) postCategoryCount.set(`${l}:${key}`, (postCategoryCount.get(`${l}:${key}`) ?? 0) + 1);
    }
  }
  const usedCategories = new Set<string>();
  const blogCategoryReport: string[] = [];

  // ---------------------------------------------------------------------------
  // Builders (run twice: collect media requests, then with final media paths)
  // ---------------------------------------------------------------------------
  function categoryKeys(node: WpPost): string[] {
    const keys = node.categories.nodes.map((c) => categories.key(c.databaseId)).filter((k): k is string => Boolean(k));
    return [...new Set(keys)];
  }

  function heroFields(node: WpPost, dir: string, title: string, where: string) {
    const fi = node.featuredImage?.node;
    const asset = fi ? media.image(fi.sourceUrl, fi.databaseId) : undefined;
    if (!asset) {
      warn('content', `${where}: no featured image`);
      return {};
    }
    const alt = fi?.altText?.trim() || (fi?.caption ? htmlToText(fi.caption) : '') || title;
    return { hero: relFrom(dir, asset.rel), heroAlt: alt };
  }

  function rewriteHtmlLinks(html: string, l: Lang, where: string): string {
    return html
      .replace(/href="([^"]*)"/g, (_m, href: string) => `href="${rewriteHref(href, { lang: l, where }, site, media) ?? href}"`)
      .replace(/https?:\/\/(\d{1,3}(\.\d{1,3}){3}|(www\.)?wewater(backend)?\.org)\/[^\s<"]*/g, (url) => {
        const out = rewriteHref(url, { lang: l, where }, site, media);
        return out?.startsWith('/') ? `https://www.wewater.org${out}` : url;
      });
  }

  function postFile(node: WpPost): OutFile {
    const ref = refOf.get(node)!;
    const where = `blog/${ref.lang}/${node.slug}`;
    const dir = path.join(paths.blog, ref.lang);
    const title = decodeEntities(node.title).trim();
    const conv = htmlToMdx(node.content ?? '', { lang: ref.lang, title, where, site, media });
    const cats = categoryKeys(node);
    cats.forEach((c) => usedCategories.add(c));
    const excerpt = excerptText(node.excerpt);
    const comments = (node.comments?.nodes ?? [])
      .filter((c) => c.status?.toUpperCase() === 'APPROVE' || !c.status)
      .sort((a, b) => (a.dateGmt ?? a.date).localeCompare(b.dateGmt ?? b.date))
      .map((c) => ({
        id: c.databaseId,
        parentId: c.parentDatabaseId || undefined,
        author: decodeEntities(c.author?.node?.name ?? 'Anonym'),
        date: isoGmt(c.dateGmt, c.date),
        type: c.type && c.type !== 'comment' ? c.type : undefined,
        html: rewriteHtmlLinks(c.content, ref.lang, `${where} (comment ${c.databaseId})`).trim(),
      }));
    const fm = frontmatter({
      title,
      date: isoGmt(node.dateGmt, node.date),
      lang: ref.lang,
      translationKey: ref.translationKey,
      author: node.author?.node.slug ?? 'thilo',
      categories: cats,
      ...heroFields(node, dir, title, where),
      excerpt,
      description: truncate(excerpt || title),
      wpId: node.databaseId,
      comments: comments.length ? comments : undefined,
    });
    const imp = importLines(conv.imports);
    return { path: path.join(dir, `${node.slug}.mdx`), content: `${fm}${imp ? `\n${imp}\n` : ''}\n${conv.body}` };
  }

  function projectFile(node: WpPost): OutFile {
    const ref = refOf.get(node)!;
    const where = `projekte/${ref.lang}/${node.slug}`;
    const dir = path.join(paths.projects, ref.lang);
    const title = decodeEntities(node.title).trim();
    const conv = htmlToMdx(node.content ?? '', { lang: ref.lang, title, where, site, media });
    const all = categoryKeys(node);
    const defs = all.map((k) => categories.get(k)).filter((d): d is CategoryDef => Boolean(d));
    const statuses = [...new Set(defs.map((d) => d.status).filter(Boolean))];
    if (statuses.length !== 1) warn('content', `${where}: expected one status category, found ${statuses.join(', ') || 'none'}`);
    const filters = [...new Set(defs.map((d) => d.product).filter((p): p is 'aqqabag' | 'aqqacube' => p === 'aqqabag' || p === 'aqqacube'))];
    const cats = defs.filter((d) => !d.status && !d.product).map((d) => d.key);
    all.forEach((c) => usedCategories.add(c));

    // Related blog posts ("Projektupdates im Blog"): the most specific category that has posts
    // in this language; else the filter product category; else "projekte".
    const count = (k: string) => postCategoryCount.get(`${ref.lang}:${k}`) ?? 0;
    const specific = cats.filter((k) => !GENERIC_CATEGORIES.has(k) && count(k) > 0).sort((a, b) => count(b) - count(a));
    const products = defs.filter((d) => d.product && count(d.key) > 0).map((d) => d.key).sort((a, b) => count(b) - count(a));
    const blogCategory = specific[0] ?? products[0] ?? (count('projekte') > 0 && all.includes('projekte') ? 'projekte' : undefined);
    blogCategoryReport.push(`${where} -> ${blogCategory ?? '(none)'}${blogCategory ? ` (${count(blogCategory)} posts)` : ''}`);

    // Meta description: first real paragraph outside the intro tiles.
    const withoutIntro = (node.content ?? '').replace(/<div class="wp-block-group block-intro[\s\S]*?<\/div><\/div>/, '');
    const firstPara = [...withoutIntro.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/g)].map((m) => htmlToText(m[1] ?? '')).find((t) => t.length >= 80);
    const fm = frontmatter({
      title,
      date: isoGmt(node.dateGmt, node.date),
      lang: ref.lang,
      translationKey: ref.translationKey,
      status: statuses[0] ?? 'in-progress',
      filters,
      categories: cats,
      blogCategory,
      ...heroFields(node, dir, title, where),
      description: truncate(firstPara ?? title),
      wpId: node.databaseId,
    });
    const imp = importLines(conv.imports);
    return { path: path.join(dir, `${node.slug}.mdx`), content: `${fm}${imp ? `\n${imp}\n` : ''}\n${conv.body}` };
  }

  function faqFiles(): OutFile[] {
    const out: OutFile[] = [];
    const pages = wp.pages.filter((p) => p.title === 'FAQ1');
    const parsed = new Map<Lang, { section: string; question: string; answer: string }[]>();
    for (const page of pages) {
      const l = lang(page, `faq page ${page.slug}`);
      const items: { section: string; question: string; answer: string }[] = [];
      let section = '';
      for (const m of (page.content ?? '').matchAll(
        /<strong class="schema-faq-question">([\s\S]*?)<\/strong>\s*<p class="schema-faq-answer">([\s\S]*?)<\/p>\s*<\/div>/g,
      )) {
        const q = htmlToText(m[1] ?? '');
        if (q === 'SUBHEADLINE') {
          section = htmlToText(m[2] ?? '');
          continue;
        }
        items.push({ section, question: q, answer: m[2] ?? '' });
      }
      parsed.set(l, items);
    }
    const germanQuestions = new Set((parsed.get('de') ?? []).map((i) => i.question));
    for (const [l, items] of parsed) {
      items.forEach((item, i) => {
        const where = `faq/${l}/${i + 1}`;
        // Yoast stored line breaks as literal "\n" and some tags HTML-escaped; clean that up.
        let html = item.answer
          .replace(/&lt;(\/?)(strong|em|b|i|a)(\s[^&]*)?>/g, '<$1$2$3>')
          .replace(/\bp\.p\d+ \{[^}]*\}\s*/g, '')
          .replace(/IBAN:\s*<br\s*\/?>\s*(?=IBAN:)/g, '')
          .replace(/(\s*\\n\s*){2,}/g, '</p><p>')
          .replace(/\s*\\n\s*/g, '<br>')
          .replace(/(^|[\s(])(https?:\/\/(www\.)?wewater(backend)?\.org\/[^\s<)]*)/g, (_m, pre: string, url: string) => {
            const target = rewriteHref(url, { lang: l, where }, site, media) ?? url;
            return `${pre}<a href="${target}">www.wewater.org${target.startsWith('/') ? target : ''}</a>`;
          });
        html = `<p>${html}</p>`;
        const conv = htmlToMdx(html, { lang: l, title: item.question, where, site, media });
        const contentLang = l !== 'de' && germanQuestions.has(item.question) ? 'de' : undefined;
        if (contentLang && i === 0) warn('faq', `faq/${l}: WordPress has no ${l} translation of the FAQ; the German text is used (contentLang: de)`);
        const fm = frontmatter({
          question: item.question,
          section: item.section,
          order: (i + 1) * 10,
          lang: l,
          contentLang,
        });
        const name = `${String(i + 1).padStart(2, '0')}-${slugify(item.question)}.md`;
        out.push({ path: path.join(paths.faq, l, name), content: `${fm}\n${conv.body}` });
      });
    }
    return out;
  }

  function pressFiles(): OutFile[] {
    const titles = ['Pressespiegel – WeWater in den Medien', 'Press – WeWater in Media', 'Revue de presse – WeWater dans les médias'];
    return wp.pages
      .filter((p) => titles.includes(decodeEntities(p.title)))
      .map((page) => {
        const l = lang(page, `press page ${page.slug}`);
        const title = decodeEntities(page.title);
        const conv = htmlToMdx(page.content ?? '', { lang: l, title, where: `press/${l}`, site, media });
        return { path: path.join(paths.press, `${l}.md`), content: `${frontmatter({ title, lang: l })}\n${conv.body}` };
      });
  }

  function buildAll(): OutFile[] {
    usedCategories.clear();
    blogCategoryReport.length = 0;
    for (const doc of Object.values(HARDCODED_DOCS)) media.doc(doc.url);
    return [...wp.posts.map(postFile), ...wp.projects.map(projectFile), ...faqFiles(), ...pressFiles()];
  }

  // ---------------------------------------------------------------------------
  // Pass 1: collect media; process media; pass 2: write
  // ---------------------------------------------------------------------------
  console.log('Converting (collect pass)…');
  buildAll();
  console.log('Processing media…');
  await media.process();
  console.log(`  media: ${JSON.stringify(media.stats)}`);
  console.log('Converting (final pass)…');
  const files = buildAll();
  for (const f of files) writeFile(f.path, f.content);

  // ---------------------------------------------------------------------------
  // Team
  // ---------------------------------------------------------------------------
  const teamPhotos = new Map<string, string>();
  const teamSorted = [...wp.team].sort((a, b) => a.date.localeCompare(b.date));
  for (const [i, member] of teamSorted.entries()) {
    const photoRel = await teamPhoto(member, media);
    if (photoRel) teamPhotos.set(member.slug, photoRel);
    const a = member.acf_team;
    const linkVal = (k: string) => {
      const v = a[k]?.trim();
      return v ? (TEAM_LINK_FIXES[v] ?? v) : undefined;
    };
    const fm = frontmatter({
      name: decodeEntities(member.title),
      order: (i + 1) * 10,
      photo: photoRel ? relFrom(paths.team, photoRel) : undefined,
      photoAlt: decodeEntities(member.title),
      role: { de: a['kurzbeschreibung'] ?? '', en: a['kurzbeschreibungEnglisch'] ?? '', fr: a['kurzbeschreibungFr'] ?? '' },
      description: {
        de: htmlToText(a['description'] ?? ''),
        en: htmlToText(a['descriptionEnglisch'] ?? ''),
        fr: htmlToText(a['descriptionFr'] ?? ''),
      },
      links: {
        email: linkVal('email'),
        website: linkVal('website'),
        linkedin: linkVal('linkedin'),
        instagram: linkVal('instagram'),
        facebook: linkVal('facebook'),
        twitter: linkVal('twitter'),
      },
      wpId: member.databaseId,
    });
    writeFile(path.join(paths.team, `${member.slug}.md`), fm);
  }

  // ---------------------------------------------------------------------------
  // Data modules: categories, authors, docs
  // ---------------------------------------------------------------------------
  writeFile(path.join(paths.data, 'categories.ts'), categoriesModule(categories, usedCategories));
  writeFile(path.join(paths.data, 'authors.ts'), await authorsModule(wp.posts, wp.team, teamPhotos));
  writeFile(path.join(paths.data, 'docs.ts'), docsModule(media));

  // ---------------------------------------------------------------------------
  // Redirects
  // ---------------------------------------------------------------------------
  const redirects = redirectsFile(site, [...refOf.entries()]);
  writeFile(paths.redirects, redirects.content);

  // ---------------------------------------------------------------------------
  // Clean up stale generated files
  // ---------------------------------------------------------------------------
  markWritten(media.written);
  const removed = generatedDirs.flatMap((d) => removeStale(d));
  if (removed.length) console.log(`Removed ${removed.length} stale files`);

  // ---------------------------------------------------------------------------
  // Report
  // ---------------------------------------------------------------------------
  const mb = (n: number) => `${(n / 1024 / 1024).toFixed(1)} MB`;
  const sizes = {
    'src/assets/wp': dirSize(paths.assetsWp),
    'src/assets/team': dirSize(paths.assetsTeam),
    'src/assets/authors': dirSize(paths.assetsAuthors),
    'public/docs': dirSize(paths.publicDocs),
    'public/media': dirSize(paths.publicMedia),
  };
  const count = (kind: 'post' | 'project', l: Lang) => [...refOf.values()].filter((r) => r.kind === kind && r.lang === l).length;
  console.log('\nDone.');
  for (const kind of ['post', 'project'] as const) console.log(`  ${kind}s: ${LANGS.map((l) => `${l} ${count(kind, l)}`).join(', ')}`);
  console.log(`  team: ${wp.team.length}, faq files: ${files.filter((f) => f.path.startsWith(paths.faq)).length}, press: ${files.filter((f) => f.path.startsWith(paths.press)).length}`);
  console.log(`  comments: ${wp.posts.reduce((n, p) => n + (p.comments?.nodes.length ?? 0), 0)}`);
  console.log(`  categories used: ${usedCategories.size}, redirects: ${redirects.count}`);
  for (const [dir, size] of Object.entries(sizes)) console.log(`  ${dir}: ${mb(size)}`);
  console.log(`  total media in repo: ${mb(Object.values(sizes).reduce((a, b) => a + b, 0))}`);
  printWarnings();
  writeFile(
    path.join(paths.cache, 'report.json'),
    JSON.stringify({ sizes, blogCategory: blogCategoryReport, warnings: allWarnings(), stats: media.stats }, null, 2),
  );
}

async function teamPhoto(member: WpTeamMember, media: Media): Promise<string | undefined> {
  const fi = member.featuredImage?.node;
  if (!fi) {
    warn('team', `${member.slug}: no photo`);
    return undefined;
  }
  const item = media.lookup(fi.sourceUrl, fi.databaseId);
  const buf = await media.fetchOriginal([fi.sourceUrl], item);
  if (!buf) {
    warn('team', `${member.slug}: photo could not be downloaded`);
    return undefined;
  }
  const out = await media.writeImage(buf, path.join(paths.assetsTeam, member.slug), `team:${member.slug}`, 1200);
  return path.relative(path.join(ROOT, 'src/assets'), out.abs).split(path.sep).join('/');
}

function tsString(s: string): string {
  return JSON.stringify(s);
}

function categoriesModule(categories: Categories, used: Set<string>): string {
  const defs = [...categories.defs.values()].filter((d) => used.has(d.key)).sort((a, b) => a.key.localeCompare(b.key));
  const unused = [...categories.defs.values()].filter((d) => !used.has(d.key)).map((d) => d.key);
  if (unused.length) warn('categories', `not used by any migrated post or project, dropped: ${unused.join(', ')}`);
  const entries = defs.map((d) => {
    const props = [
      `label: { de: ${tsString(d.label.de)}, en: ${tsString(d.label.en)}, fr: ${tsString(d.label.fr)} }`,
      d.color ? `color: ${tsString(d.color)}` : '',
      d.isPress ? 'isPress: true' : '',
      d.status ? `status: ${tsString(d.status)}` : '',
      d.product ? `product: ${tsString(d.product)}` : '',
    ].filter(Boolean);
    return `  ${/^[a-z]\w*$/.test(d.key) ? d.key : tsString(d.key)}: { ${props.join(', ')} },`;
  });
  return `/**
 * Blog/project categories, keyed by a stable id. Content references them by key
 * (\`categories: [dr-kongo]\` in frontmatter); the schema rejects unknown keys.
 *
 * Generated by scripts/migrate-wp from the WordPress categories (Polylang translations merged,
 * the colour came from the WordPress description field). Re-running the migration overwrites
 * this file; after cutover edit it by hand.
 *
 * - label: shown on cards and the post header, per language
 * - color: colour of the dot next to the label (cards fall back to the brand colours)
 * - isPress: press releases (listed on /presse/)
 * - status: project status categories (projects use the \`status\` field instead)
 * - product: filter product categories (projects use the \`filters\` field instead)
 */
import type { Locale } from '@/i18n';

export interface Category {
  label: Record<Locale, string>;
  color?: string;
  isPress?: boolean;
  status?: 'in-progress' | 'completed';
  product?: 'aqqabag' | 'aqqacube' | 'aqqasystem';
}

const categoryData = {
${entries.join('\n')}
} satisfies Record<string, Category>;

export type CategoryKey = keyof typeof categoryData;

export const categories: Record<CategoryKey, Category> = categoryData;

export const categoryKeys = Object.keys(categoryData) as [CategoryKey, ...CategoryKey[]];

/** Label of a category in the given language. */
export function categoryLabel(key: CategoryKey, locale: Locale): string {
  return categories[key].label[locale];
}
`;
}

async function authorsModule(posts: WpPost[], team: WpTeamMember[], teamPhotos: Map<string, string>): Promise<string> {
  const authors = new Map<string, NonNullable<WpPost['author']>['node']>();
  for (const p of posts) if (p.author) authors.set(p.author.node.slug, p.author.node);
  const imports: string[] = [];
  const entries: string[] = [];
  for (const [slug, a] of [...authors].sort(([x], [y]) => x.localeCompare(y))) {
    const teamSlug = AUTHOR_TEAM[slug];
    const member = team.find((t) => t.slug === teamSlug);
    const ident = 'avatar' + slug.replace(/(^|-)(\w)/g, (_m, _d, c: string) => c.toUpperCase());
    let avatarRel = teamSlug ? teamPhotos.get(teamSlug) : undefined;
    if (!avatarRel && a.avatar?.url) {
      // Only real Gravatars (d=404), not the generic silhouette.
      const url = a.avatar.url.replace(/\?.*$/, '') + '?s=256&d=404';
      const buf = await fetchCached(url, `gravatar-${slug}.img`);
      if (buf) {
        const out = await new Media([], undefined).writeImage(buf, path.join(paths.assetsAuthors, slug), `author:${slug}`, 512);
        markWritten([out.abs]);
        avatarRel = path.relative(path.join(ROOT, 'src/assets'), out.abs).split(path.sep).join('/');
      }
    }
    if (avatarRel) imports.push(`import ${ident} from '@/assets/${avatarRel}';`);
    else warn('authors', `${slug}: no portrait (no Gravatar, not a team member)`);
    const wpBio = parseQtranslate(a.description);
    const acf = member?.acf_team;
    const teamBio = (field: string) => (acf?.[field] ? htmlToText(acf[field]) : undefined);
    const bio: Record<Lang, string | undefined> = {
      de: wpBio.de || teamBio('description'),
      en: teamBio('descriptionEnglisch') || wpBio.en,
      fr: teamBio('descriptionFr') || wpBio.fr,
    };
    const bioProps = LANGS.filter((l) => bio[l]).map((l) => `${l}: ${tsString(bio[l]!)}`);
    const props = [
      `name: ${tsString(decodeEntities(a.name))}`,
      avatarRel ? `avatar: ${ident}` : '',
      `description: { ${bioProps.join(', ')} }`,
      teamSlug && member ? `team: ${tsString(teamSlug)}` : '',
    ].filter(Boolean);
    entries.push(`  ${/^[a-z]\w*$/.test(slug) ? slug : tsString(slug)}: {\n    ${props.join(',\n    ')},\n  },`);
  }
  return `/**
 * Blog authors, keyed by the WordPress user slug. Posts reference them in frontmatter
 * (\`author: thilo\`); the schema rejects unknown keys.
 *
 * Generated by scripts/migrate-wp: name and German bio from WordPress; authors who are team
 * members use their team portrait and translated team bio. Re-running the migration overwrites
 * this file; after cutover edit it by hand. Portraits live in src/assets/team/ or src/assets/authors/.
 */
import type { ImageMetadata } from 'astro';
import type { Locale } from '@/i18n';
${imports.join('\n')}

export interface Author {
  name: string;
  /** Portrait. Missing for authors without a photo: show a neutral placeholder. */
  avatar?: ImageMetadata;
  /** "About the author" text per language. Fall back to German when a language is missing. */
  description: Partial<Record<Locale, string>>;
  /** Slug of the matching entry in src/content/team/, if the author is on the team page. */
  team?: string;
}

const authorData = {
${entries.join('\n')}
} satisfies Record<string, Author>;

export type AuthorKey = keyof typeof authorData;

export const authors: Record<AuthorKey, Author> = authorData;

export const authorKeys = Object.keys(authorData) as [AuthorKey, ...AuthorKey[]];
`;
}

function docsModule(media: Media): string {
  const lines = Object.entries(HARDCODED_DOCS).map(([key, d]) => {
    const url = media.doc(d.url);
    if (!url) warn('docs', `${key}: ${d.url} could not be downloaded`);
    return `  /** ${d.note} */\n  ${key}: ${tsString(url ?? d.url)},`;
  });
  return `/**
 * Documents (PDFs) in public/docs/, by a stable key, for pages that link to them:
 *   import { docs } from '@/data/docs';  <a href={docs.satzung}>…</a>
 *
 * Generated by scripts/migrate-wp (the files were WordPress uploads). Documents linked from
 * blog posts and projects are referenced directly as /docs/<file> in the MDX.
 * To replace a document, overwrite the file in public/docs/ (or add a new file and change the path here).
 */
export const docs = {
${lines.join('\n')}
} as const;

export type DocKey = keyof typeof docs;
`;
}

function redirectsFile(site: SiteIndex, refs: [WpPost, ContentRef][]): { content: string; count: number } {
  const cross: string[] = [];
  const legacy: string[] = [];
  for (const [node, ref] of refs) {
    const base = ref.kind === 'post' ? `/blog/${ref.slug}/` : `/projekte/${ref.slug}/`;
    for (const l of LANGS) {
      if (l === ref.lang) continue;
      cross.push(`${localize(base, l)} ${site.urlIn(ref, l)} 301`);
    }
    if (ref.kind === 'post') {
      const [y, m, d] = node.date.slice(0, 10).split('-');
      legacy.push(`/${y}/${m}/${d}/${ref.slug}/ ${contentUrl(ref)} 301`);
    } else {
      legacy.push(`/project/${ref.slug}/ ${contentUrl(ref)} 301`);
    }
  }
  const pad = (lines: string[]) => {
    const w = Math.max(...lines.map((l) => l.split(' ')[0]?.length ?? 0));
    return lines.sort().map((l) => {
      const [from = '', to = '', code = ''] = l.split(' ');
      return `${from.padEnd(w)}  ${to}  ${code}`;
    });
  };
  const content = `# Netlify redirects. Generated by scripts/migrate-wp (npm run migrate:wp); re-running overwrites this file.
# Fixed redirects (/shop, /spende) are in netlify.toml.

# The old Gatsby site rendered every post and project under all three language prefixes.
# Each piece of content now exists only in its own language: the other-language URLs go to
# the translation in that language if there is one, otherwise to the original.
${pad(cross).join('\n')}

# WordPress permalinks from before the Gatsby site (/yyyy/mm/dd/slug/, /project/slug/).
${pad(legacy).join('\n')}
`;
  return { content, count: cross.length + legacy.length };
}

if (!existsSync(path.join(ROOT, 'package.json'))) throw new Error(`Unexpected repo root: ${ROOT}`);
await main();
