/**
 * WordPress HTML (rendered `content`) -> MDX.
 *
 * Plain prose becomes Markdown. WordPress blocks and embeds become the components in
 * src/components/content/ (imported at the top of each MDX file):
 *   images -> <Figure>, galleries -> <Gallery>, project "block-intro" group -> <IntroTiles>,
 *   columns -> <Columns>/<Column>, YouTube -> <YouTube>, betterplace -> <DonationForm>,
 *   Facebook plugin -> <FacebookPost>, video -> <Video>.
 */
import TurndownService from 'turndown';
import type { Lang } from './config.ts';
import { rewriteHref, markdownDestination, type SiteIndex } from './links.ts';
import { Media, type ImageAsset } from './media.ts';
import { warn } from './log.ts';
import { decodeEntities, htmlToText, humanizeFileTitle, jsxAttr, slugifyHeading } from './text.ts';

export interface ConvertOptions {
  lang: Lang;
  /** Title of the post/project, used for fallback alt texts. */
  title: string;
  /** Location for warnings, e.g. "blog/de/foo". */
  where: string;
  site: SiteIndex;
  media: Media;
}

export interface ConvertResult {
  body: string;
  imports: string[];
}

const COMPONENT_ORDER = ['Figure', 'Gallery', 'IntroTiles', 'Columns', 'Column', 'YouTube', 'DonationForm', 'FacebookPost', 'Video'];

export function importLines(names: string[]): string {
  return COMPONENT_ORDER.filter((n) => names.includes(n))
    .map((n) => `import ${n} from '@/components/content/${n}.astro';`)
    .join('\n');
}

const PHOTO_WORD: Record<Lang, string> = { de: 'Foto', en: 'photo', fr: 'photo' };

function hasClass(node: Element | null | undefined, cls: string): boolean {
  return Boolean(node && typeof node.getAttribute === 'function' && ` ${node.getAttribute('class') ?? ''} `.includes(` ${cls} `));
}

function closest(node: Element, test: (el: Element) => boolean, stop?: Element): Element | undefined {
  let cur: Element | null = node.parentElement;
  while (cur && cur !== stop) {
    if (test(cur)) return cur;
    cur = cur.parentElement;
  }
  return undefined;
}

function elementChildren(node: Element): Element[] {
  return Array.from(node.childNodes).filter((n): n is Element => n.nodeType === 1);
}

function wpImageId(img: Element): number | undefined {
  const m = (img.getAttribute('class') ?? '').match(/wp-image-(\d+)/) ?? (img.getAttribute('data-id') ?? '').match(/^(\d+)$/);
  return m?.[1] ? Number(m[1]) : undefined;
}

function text(node: Element | null | undefined): string {
  return (node?.textContent ?? '').replace(/[ \s]+/g, ' ').trim();
}

const URL_IN_TEXT = /(https?:\/\/[^\s<>"']+|www\.[^\s<>"']+)/g;

/** Markdown escaping (turndown's rules) plus what MDX needs: { } < and entity-like &. */
function escapeMdx(input: string): string {
  return input
    .split(URL_IN_TEXT)
    .map((part, i) => {
      if (i % 2 === 1) return part.replace(/[{}<]/g, (m) => encodeURIComponent(m));
      return part
        .replace(/\\/g, '\\\\')
        .replace(/\*/g, '\\*')
        .replace(/^-/g, '\\-')
        .replace(/^\+ /g, '\\+ ')
        .replace(/^(=+)/g, '\\$1')
        .replace(/^(#{1,6}) /g, '\\$1 ')
        .replace(/`/g, '\\`')
        .replace(/^~~~/g, '\\~~~')
        .replace(/\[/g, '\\[')
        .replace(/\]/g, '\\]')
        .replace(/^>/g, '\\>')
        .replace(/_/g, '\\_')
        .replace(/^(\d+)\. /g, '$1\\. ')
        .replace(/[{}<]/g, (m) => '\\' + m)
        .replace(/&(?=[a-zA-Z0-9#]+;)/g, '\\&');
    })
    .join('');
}

export function htmlToMdx(html: string, opts: ConvertOptions): ConvertResult {
  const imports = new Set<string>();
  const imageNumbers = new Map<string, number>();
  const headings = new Map<string, string>();
  for (const m of html.matchAll(/<h([1-6])[^>]*>([\s\S]*?)<\/h\1>/gi)) {
    const t = htmlToText(m[2] ?? '');
    if (t) headings.set(t.toLowerCase(), slugifyHeading(t));
  }

  const service = new TurndownService({
    headingStyle: 'atx',
    hr: '---',
    bulletListMarker: '-',
    codeBlockStyle: 'fenced',
    emDelimiter: '_',
    strongDelimiter: '**',
    br: '\\',
  });
  service.escape = escapeMdx;

  const linkContext = (node: Element) => ({ lang: opts.lang, where: opts.where, headings, linkText: text(node) });

  // ---- helpers producing component markup -------------------------------------------

  function fallbackAlt(key: string): string {
    let n = imageNumbers.get(key);
    if (n === undefined) {
      n = imageNumbers.size + 1;
      imageNumbers.set(key, n);
    }
    return `${opts.title} (${PHOTO_WORD[opts.lang]} ${n})`;
  }

  function imageFor(img: Element): { asset: ImageAsset; url: string } | undefined {
    const url = img.getAttribute('data-full-url') || img.getAttribute('data-orig-file') || img.getAttribute('src') || '';
    if (!url) {
      warn('images', `${opts.where}: empty image block (no src in WordPress) dropped`);
      return undefined;
    }
    const asset = opts.media.image(url, wpImageId(img));
    if (!asset) {
      warn('images', `${opts.where}: image not migrated (not a WordPress upload or download failed): ${url}`);
      return undefined;
    }
    return { asset, url };
  }

  function altFor(img: Element, asset: ImageAsset, url: string, caption: string, linked: boolean): string {
    const own = decodeEntities(img.getAttribute('alt') ?? '').trim();
    if (own) return own;
    const lib = asset.item?.altText?.trim();
    if (lib) return lib;
    if (caption) return caption;
    const libCaption = asset.item?.caption ? htmlToText(asset.item.caption) : '';
    if (libCaption) return libCaption;
    if (linked) {
      const t = humanizeFileTitle(asset.item?.title);
      if (t) return t;
    }
    return fallbackAlt(url);
  }

  /** href for an image wrapped in a link: none for links to the image file itself. */
  function imageLink(img: Element): string | undefined {
    const a = closest(img, (el) => el.nodeName === 'A');
    const href = a?.getAttribute('href');
    if (!a || !href) return undefined;
    if (/\/wp-content\/uploads\/.*\.(jpe?g|png|gif|webp)$/i.test(href) || /attachment_id=|\/attachment\//.test(href)) return undefined;
    return rewriteHref(href, linkContext(a), opts.site, opts.media);
  }

  function figure(img: Element, captionHtml: string | undefined): string {
    const found = imageFor(img);
    if (!found) return '';
    imports.add('Figure');
    const href = imageLink(img);
    const captionMd = captionHtml ? inline(captionHtml) : '';
    const captionText = captionHtml ? htmlToText(captionHtml) : '';
    const alt = altFor(img, found.asset, found.url, captionText, Boolean(href));
    const attrs = jsxAttr('src', found.asset.rel) + jsxAttr('alt', alt) + jsxAttr('href', href);
    return captionMd ? `\n\n<Figure${attrs}>${captionMd}</Figure>\n\n` : `\n\n<Figure${attrs} />\n\n`;
  }

  /** Convert an HTML fragment to single-line inline Markdown (captions, table cells). */
  function inline(fragment: string): string {
    return service
      .turndown(`<span>${fragment}</span>`)
      .replace(/\\\n/g, '<br />')
      .replace(/\n+/g, ' ')
      .trim();
  }

  // ---- rules (later rules win) ----------------------------------------------------------

  service.remove(['script', 'style', 'noscript', 'meta', 'link', 'form', 'input', 'button', 'select', 'textarea']);

  service.addRule('paragraph', {
    filter: 'p',
    replacement: (content) => {
      const c = content.replace(/^(\s*\\\n)+/, '').replace(/(\\\n\s*)+$/, '').trim();
      return c ? `\n\n${c}\n\n` : '';
    },
  });

  service.addRule('listItem', {
    filter: 'li',
    replacement: (content, node) => {
      const parent = node.parentNode as Element | null;
      let prefix = '- ';
      if (parent?.nodeName === 'OL') {
        const start = Number(parent.getAttribute('start') ?? '1');
        const index = Array.prototype.indexOf.call(parent.children, node);
        prefix = `${start + index}. `;
      }
      const body = content
        .replace(/^\n+/, '')
        .replace(/\n+$/, '\n')
        .replace(/\n/gm, '\n' + ' '.repeat(prefix.length));
      return prefix + body + (node.nextSibling && !/\n$/.test(body) ? '\n' : '');
    },
  });

  service.addRule('heading', {
    filter: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
    replacement: (content, node) => {
      const level = Math.max(2, Number(node.nodeName.charAt(1)));
      // Images/embeds inside a heading (classic editor) are moved below it.
      const blocks: string[] = [];
      content = content.replace(/\n*(<(Figure|Gallery|Video)\b[\s\S]*?(\/>|<\/\2>)|<(YouTube|DonationForm|FacebookPost)\b[\s\S]*?\/>)\n*/g, (m) => {
        blocks.push(m.trim());
        return ' ';
      });
      const t = content
        .replace(/\\\n|<br \/>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .replace(/^\*\*(.+)\*\*$/, '$1')
        .trim();
      const heading = t ? `${'#'.repeat(level)} ${t}` : '';
      return `\n\n${[heading, ...blocks].filter(Boolean).join('\n\n')}\n\n`;
    },
  });

  // Emphasis: line breaks at the edges move outside the markers (`**text\\\n**` would break).
  for (const [key, tags, marker] of [
    ['strong', ['strong', 'b'], '**'],
    ['emphasis', ['em', 'i'], '*'],
  ] as const) {
    service.addRule(key, {
      filter: [...tags],
      replacement: (content) => {
        const inner = content.replace(/^(\s*\\\n)+/, '').replace(/(\\\n\s*)+$/, '');
        if (!inner.trim()) return '';
        const trailingBreak = /\\\n\s*$/.test(content) ? '\\\n' : '';
        return `${marker}${inner.trim()}${marker}${trailingBreak}`;
      },
    });
  }

  service.addRule('inlineHtml', {
    filter: ['u', 'sup', 'sub'],
    replacement: (content, node) => {
      const tag = node.nodeName.toLowerCase();
      const inner = content.replace(/^(\s*\\\n)+/, '').replace(/(\\\n\s*)+$/, '');
      return inner.trim() ? `<${tag}>${inner}</${tag}>` : '';
    },
  });

  service.addRule('cite', {
    filter: ['cite'],
    replacement: (content) => (content.trim() ? `_${content.trim()}_` : ''),
  });

  service.addRule('link', {
    filter: (node) => node.nodeName === 'A',
    replacement: (content, node) => {
      if (node.querySelector('img')) return content;
      // Line breaks at the edges of a link belong outside it.
      content = content.replace(/^(\s*\\\n)+/, '').replace(/(\\\n\s*)+$/, '');
      if (!content.trim()) return '';
      const href = node.getAttribute('href');
      if (!href) return content;
      const out = rewriteHref(href, linkContext(node), opts.site, opts.media);
      if (!out) return content;
      return `[${content}](${markdownDestination(out)})`;
    },
  });

  service.addRule('image', {
    filter: 'img',
    replacement: (_content, node) => figure(node, undefined),
  });

  service.addRule('figure', {
    filter: (node) =>
      (node.nodeName === 'FIGURE' || (node.nodeName === 'DIV' && (hasClass(node, 'wp-caption') || hasClass(node, 'wp-block-image')))) &&
      !hasClass(node, 'wp-block-gallery') &&
      node.querySelectorAll('img').length === 1 &&
      !node.querySelector('table, iframe, video, figure figure'),
    replacement: (_content, node) => {
      const img = node.querySelector('img');
      if (!img) return '';
      const cap = node.querySelector('figcaption, .wp-caption-text');
      return figure(img, cap ? cap.innerHTML : undefined);
    },
  });

  service.addRule('gallery', {
    filter: (node) =>
      (node.nodeName === 'FIGURE' && hasClass(node, 'wp-block-gallery')) ||
      (node.nodeName === 'DIV' && hasClass(node, 'gallery')) ||
      (node.nodeName === 'UL' && hasClass(node, 'blocks-gallery-grid') && !closest(node, (el) => hasClass(el, 'wp-block-gallery'))),
    replacement: (_content, node) => {
      const items: string[] = [];
      const imgs = Array.from(node.querySelectorAll('img'));
      for (const img of imgs) {
        const found = imageFor(img);
        if (!found) continue;
        const fig = closest(img, (el) => el.nodeName === 'FIGURE' || el.nodeName === 'LI', node);
        const capEl = fig?.querySelector('figcaption');
        const caption = capEl ? htmlToText(capEl.innerHTML) : '';
        const alt = altFor(img, found.asset, found.url, caption, false);
        items.push(
          `    { src: ${JSON.stringify(found.asset.rel)}, alt: ${JSON.stringify(alt)}${caption ? `, caption: ${JSON.stringify(caption)}` : ''} },`,
        );
      }
      if (items.length === 0) return '';
      const galleryCaptionEl = elementChildren(node).find((el) => el.nodeName === 'FIGCAPTION');
      const galleryCaption = galleryCaptionEl ? htmlToText(galleryCaptionEl.innerHTML) : '';
      const cols = (node.getAttribute('class') ?? '').match(/columns-(\d)/)?.[1];
      imports.add('Gallery');
      return (
        `\n\n<Gallery${cols ? jsxAttr('columns', Number(cols)) : ''}${jsxAttr('caption', galleryCaption || undefined)}\n` +
        `  images={[\n${items.join('\n')}\n  ]}\n/>\n\n`
      );
    },
  });

  service.addRule('video', {
    filter: (node) => node.nodeName === 'VIDEO' || (node.nodeName === 'FIGURE' && hasClass(node, 'wp-block-video')),
    replacement: (_content, node) => {
      const video = node.nodeName === 'VIDEO' ? node : node.querySelector('video');
      const src = video?.getAttribute('src') || video?.querySelector('source')?.getAttribute('src') || '';
      const asset = opts.media.video(src);
      if (!asset) {
        warn('video', `${opts.where}: video not migrated: ${src}`);
        return '';
      }
      imports.add('Video');
      const cap = node.querySelector('figcaption');
      const captionMd = cap ? inline(cap.innerHTML) : '';
      const attrs =
        jsxAttr('src', asset.src) +
        jsxAttr('poster', asset.poster) +
        jsxAttr('width', asset.width) +
        jsxAttr('height', asset.height) +
        jsxAttr('title', captionMd ? undefined : opts.title);
      return captionMd ? `\n\n<Video${attrs}>${captionMd}</Video>\n\n` : `\n\n<Video${attrs} />\n\n`;
    },
  });

  service.addRule('iframe', {
    filter: 'iframe',
    replacement: (_content, node) => {
      const src = decodeEntities(node.getAttribute('src') ?? '').trim();
      const title = decodeEntities(node.getAttribute('title') ?? '').trim();
      if (/betterplace\.org\/(de|en|fr)\/donate\/iframe\//.test(src)) {
        imports.add('DonationForm');
        return `\n\n<DonationForm${jsxAttr('src', src)} />\n\n`;
      }
      if (/betterplace-widget\.org|project-widget\.betterplace\.org/.test(src)) {
        // Small betterplace progress widgets: same lazy iframe, 320px high, with a fallback link.
        const fallback = decodeEntities(decodeEntities(decodeEntities(decodeEntities(node.innerHTML))));
        const href = fallback.match(/https:\/\/www\.betterplace\.org\/[^'"&\s<>]+/)?.[0];
        imports.add('DonationForm');
        return `\n\n<DonationForm${jsxAttr('src', src)}${jsxAttr('height', 320)}${jsxAttr('mobileHeight', 320)}${jsxAttr('href', href)} />\n\n`;
      }
      const yt = src.match(/youtube(?:-nocookie)?\.com\/embed\/([A-Za-z0-9_-]{11})/);
      if (yt?.[1]) {
        imports.add('YouTube');
        return `\n\n<YouTube${jsxAttr('id', yt[1])}${jsxAttr('title', title || opts.title)} />\n\n`;
      }
      if (/facebook\.com\/plugins\//.test(src)) {
        const href = new URL(src).searchParams.get('href');
        if (href) {
          imports.add('FacebookPost');
          return `\n\n<FacebookPost${jsxAttr('href', href)} />\n\n`;
        }
      }
      warn('embeds', `${opts.where}: unknown iframe replaced by a link: ${src}`);
      return src ? `\n\n[${escapeMdx(title || src)}](${markdownDestination(src)})\n\n` : '';
    },
  });

  service.addRule('table', {
    filter: 'table',
    replacement: (_content, node) => {
      const rows = Array.from(node.querySelectorAll('tr'));
      const head = node.querySelector('thead tr');
      const ordered = head ? [head, ...rows.filter((r) => r !== head)] : rows;
      const matrix = ordered.map((tr) =>
        elementChildren(tr)
          .filter((c) => c.nodeName === 'TD' || c.nodeName === 'TH')
          .map((c) => inline(c.innerHTML).replace(/\|/g, '\\|')),
      );
      const width = Math.max(0, ...matrix.map((r) => r.length));
      if (width === 0) return '';
      // Drop empty rows; a first row with a single filled cell is a title, not a header row
      // (empty header cells fail the accessibility check td-has-header).
      const rowsWithText = matrix.filter((r) => r.some((c) => c.trim()));
      let title = '';
      if (rowsWithText.length > 2 && rowsWithText[0]!.filter((c) => c.trim()).length === 1 && width > 1) {
        title = rowsWithText.shift()!.find((c) => c.trim())!.trim();
        if (!/^\*\*.*\*\*$/.test(title)) title = `**${title}**`;
      }
      const line = (cells: string[]) => `| ${Array.from({ length: width }, (_, i) => cells[i] ?? '').join(' | ')} |`;
      const [first = [], ...rest] = rowsWithText;
      const table = [line(first), line(Array(width).fill('---')), ...rest.map(line)].join('\n');
      return `\n\n${title ? `${title}\n\n` : ''}${table}\n\n`;
    },
  });

  service.addRule('columns', {
    filter: (node) => node.nodeName === 'DIV' && hasClass(node, 'wp-block-columns'),
    replacement: (_content, node) => {
      const cols = elementChildren(node)
        .filter((c) => hasClass(c, 'wp-block-column'))
        .map((c) => service.turndown(c as HTMLElement).trim())
        .filter(Boolean);
      if (cols.length <= 1) return `\n\n${cols.join('')}\n\n`;
      imports.add('Columns');
      imports.add('Column');
      return `\n\n<Columns>\n\n${cols.map((c) => `<Column>\n\n${c}\n\n</Column>`).join('\n\n')}\n\n</Columns>\n\n`;
    },
  });

  service.addRule('introTiles', {
    filter: (node) => node.nodeName === 'DIV' && hasClass(node, 'block-intro'),
    replacement: (content, node) => {
      const inner = elementChildren(node).find((c) => hasClass(c, 'wp-block-group__inner-container')) ?? node;
      const children = elementChildren(inner);
      const colsIndex = children.findIndex((c) => hasClass(c, 'wp-block-columns'));
      const cols = children[colsIndex];
      const heads = children.slice(0, Math.max(0, colsIndex)).filter((c) => /^H[1-6]$/.test(c.nodeName));
      if (!cols || heads.length < 2) {
        warn('intro-tiles', `${opts.where}: unexpected block-intro structure, kept as text`);
        return content;
      }
      const tiles = elementChildren(cols)
        .filter((c) => hasClass(c, 'wp-block-column'))
        .map((col) => {
          const parts = elementChildren(col);
          const title = text(parts.find((p) => /^H[1-6]$/.test(p.nodeName)));
          const body = parts
            .filter((p) => p.nodeName === 'P')
            .map((p) => text(p))
            .filter(Boolean)
            .join('\n\n');
          return `    { title: ${JSON.stringify(title)}, text: ${JSON.stringify(body)} },`;
        });
      if (tiles.length !== 4) warn('intro-tiles', `${opts.where}: block-intro has ${tiles.length} tiles (expected 4)`);
      // The old template showed the second heading as the small subtitle above the first.
      const title = text(heads[0]);
      const subtitle = text(heads[1]);
      const extra = children
        .slice(colsIndex + 1)
        .map((c) => service.turndown(c as HTMLElement).trim())
        .filter(Boolean)
        .join('\n\n');
      imports.add('IntroTiles');
      const tag = `<IntroTiles${jsxAttr('subtitle', subtitle)}${jsxAttr('title', title)}\n  tiles={[\n${tiles.join('\n')}\n  ]}\n/>`;
      return `\n\n${tag}\n\n${extra}\n\n`;
    },
  });

  const cleaned = html
    .replace(/\r\n?/g, '\n')
    .replace(/<!--[\s\S]*?-->/g, '')
    // Pasted Pages/Word junk: "p.p1 {margin: …}" inside text.
    .replace(/\b(p|span|li)\.[a-z]+\d+ \{[^}]*\}\s*/g, '');
  const markdown = service.turndown(cleaned);
  return { body: finalize(markdown), imports: [...imports] };
}

/** Normalise heading levels so they start at h2 and never skip a level (Lighthouse heading-order). */
function normalizeHeadings(md: string): string {
  const lines = md.split('\n');
  const levels = [...new Set(lines.map((l) => l.match(/^(#{2,6}) /)?.[1]?.length).filter((n): n is number => Boolean(n)))].sort();
  const remap = new Map(levels.map((lvl, i) => [lvl, i + 2]));
  let prev = 1;
  return lines
    .map((line) => {
      const m = line.match(/^(#{2,6}) (.*)$/);
      if (!m?.[1]) return line;
      const level = Math.min(remap.get(m[1].length) ?? m[1].length, prev + 1);
      prev = level;
      return `${'#'.repeat(level)} ${m[2] ?? ''}`;
    })
    .join('\n');
}

export function finalize(markdown: string): string {
  let md = markdown.replace(/ /g, ' ').replace(/[ \t]+$/gm, '');
  // Two line breaks in a row (<br><br>) are a paragraph break.
  md = md.replace(/(\\\n){2,}/g, '\n\n');
  // A hard line break right before a blank line or the end renders as a stray backslash.
  for (let i = 0; i < 5; i++) {
    md = md.replace(/^\\$/gm, '').replace(/\\\n(?=[ \t]*(\n|$))/g, '\n').replace(/\\$/g, '');
  }
  md = md.replace(/\n{3,}/g, '\n\n');
  // A line starting with "import " or "export " would be parsed as ESM by MDX.
  md = md.replace(/^(import|export)(\s)/gm, (_m, word: string, space: string) => `&#${word.charCodeAt(0)};${word.slice(1)}${space}`);
  md = normalizeHeadings(md);
  return md.trim() + '\n';
}
