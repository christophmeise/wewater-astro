/**
 * Link rewriting: old wewater.org / wewaterbackend.org / raw-IP links become site-relative
 * paths of the new site; upload links become /docs/ files.
 */
import type { Lang } from './config.ts';
import { decodeEntities } from './text.ts';
import { warn } from './log.ts';
import { Media, normalizeUploadUrl } from './media.ts';

export type ContentKind = 'post' | 'project';

export interface ContentRef {
  kind: ContentKind;
  slug: string;
  lang: Lang;
  translationKey: string;
  wpId: number;
}

export function localize(path: string, lang: Lang): string {
  return lang === 'de' ? path : `/${lang}${path}`;
}

export function contentUrl(ref: Pick<ContentRef, 'kind' | 'slug' | 'lang'>): string {
  return localize(ref.kind === 'post' ? `/blog/${ref.slug}/` : `/projekte/${ref.slug}/`, ref.lang);
}

export class SiteIndex {
  private bySlug = new Map<string, ContentRef>();
  private byId = new Map<number, ContentRef>();
  private groups = new Map<string, Map<Lang, ContentRef>>();

  add(ref: ContentRef): void {
    this.bySlug.set(`${ref.kind}:${ref.slug}`, ref);
    this.byId.set(ref.wpId, ref);
    const key = `${ref.kind}:${ref.translationKey}`;
    const group = this.groups.get(key) ?? new Map<Lang, ContentRef>();
    group.set(ref.lang, ref);
    this.groups.set(key, group);
  }

  find(kind: ContentKind | undefined, slug: string): ContentRef | undefined {
    const get = (s: string) =>
      kind ? this.bySlug.get(`${kind}:${s}`) : (this.bySlug.get(`post:${s}`) ?? this.bySlug.get(`project:${s}`));
    // WordPress appends -2 when a slug is reused; old links sometimes point at the original slug.
    return get(slug) ?? get(`${slug}-2`);
  }

  findById(id: number): ContentRef | undefined {
    return this.byId.get(id);
  }

  translations(ref: ContentRef): Map<Lang, ContentRef> {
    return this.groups.get(`${ref.kind}:${ref.translationKey}`) ?? new Map([[ref.lang, ref]]);
  }

  /** URL of `ref`, or of its translation in `lang` if that exists. */
  urlIn(ref: ContentRef, lang: Lang | undefined): string {
    const target = (lang && this.translations(ref).get(lang)) || ref;
    return contentUrl(target);
  }
}

/** Old paths of static pages -> path on the new site (German, unprefixed). */
const STATIC_PAGES: Record<string, string> = {
  '': '/',
  spenden: '/spenden/',
  spende: '/spenden/',
  'spenden/einmalig': '/spenden/einmalig/',
  'spenden/monatlich': '/spenden/monatlich/',
  filtersystem: '/filtersystem/',
  filtersysteme: '/filtersystem/',
  'filtersysteme/aqqabag': '/filtersysteme/aqqabag/',
  'filtersysteme/aqqacube': '/filtersysteme/aqqacube/',
  'filtersysteme/aqqasystem': '/filtersysteme/aqqasystem/',
  'filtersysteme/tutorials': '/filtersysteme/tutorials/',
  'aqqa-bag': '/filtersysteme/aqqabag/',
  'aqqa-cube': '/filtersysteme/aqqacube/',
  'aqqa-system': '/filtersysteme/aqqasystem/',
  team: '/team/',
  presse: '/presse/',
  faq: '/faq/',
  unterstuetzen: '/unterstuetzen/',
  impressum: '/impressum/',
  dataprotection: '/dataprotection/',
  datenschutz: '/dataprotection/',
  projekte: '/projekte/',
  blog: '/blog/',
};

const INTERNAL_HOST = /^((www\.)?(wewater|wewaterbackend)\.org|\d{1,3}(\.\d{1,3}){3})$/i;

export interface LinkContext {
  lang: Lang;
  /** Where the link is, for warnings. */
  where: string;
  /** Heading text (lowercase, trimmed) -> anchor id, for broken in-page links. */
  headings?: Map<string, string>;
  linkText?: string;
}

/**
 * Rewrite one href. Returns undefined when the link should be removed (its text kept).
 */
export function rewriteHref(raw: string, ctx: LinkContext, site: SiteIndex, media: Media): string | undefined {
  const href = decodeEntities(raw).trim();
  if (!href || href === '#') return undefined;
  if (href.startsWith('#')) return href;
  if (/^mailto:/i.test(href)) return href.replace(/@\d{1,3}(\.\d{1,3}){3}/, '@wewater.org');
  if (/^(tel|sms):/i.test(href)) return href;

  const scheme = href.match(/^([a-z][a-z0-9+.-]*):/i)?.[1]?.toLowerCase();
  const looksLikeUrl = (scheme !== undefined && /^(https?|ftp)$/.test(scheme)) || href.startsWith('/') || /^www\./i.test(href);
  if (!looksLikeUrl) {
    // e.g. href="Kabonyo: Wenn das Wasser salzig wird" (meant as an in-page jump link).
    const anchor = ctx.headings?.get(href.toLowerCase()) ?? (ctx.linkText ? ctx.headings?.get(ctx.linkText.toLowerCase()) : undefined);
    if (anchor) return `#${anchor}`;
    warn('links', `${ctx.where}: removed broken link href="${href}"`);
    return undefined;
  }

  let url: URL;
  try {
    url = new URL(/^www\./i.test(href) ? `https://${href}` : href, 'https://www.wewater.org');
  } catch {
    warn('links', `${ctx.where}: unparseable href "${href}" removed`);
    return undefined;
  }
  if (!/^https?:$/.test(url.protocol)) return href;
  if (!INTERNAL_HOST.test(url.hostname)) return href;

  // Uploaded files.
  if (url.pathname.includes('/wp-content/uploads/')) {
    const upload = normalizeUploadUrl(url.href);
    const local = upload ? media.doc(upload) : undefined;
    if (local) return local;
    warn('links', `${ctx.where}: upload link kept external: ${href}`);
    return href;
  }

  const hash = url.hash;
  let segments = url.pathname.split('/').filter(Boolean).map((s) => {
    try {
      return decodeURIComponent(s);
    } catch {
      return s;
    }
  });
  let explicitLang: Lang | undefined;
  if (segments[0] === 'en' || segments[0] === 'fr' || segments[0] === 'de') {
    explicitLang = segments[0] as Lang;
    segments = segments.slice(1);
  }
  const targetLang = explicitLang ?? ctx.lang;

  // ?p=123 style links.
  const p = url.searchParams.get('p') ?? url.searchParams.get('page_id');
  if (p && segments.length === 0) {
    const ref = site.findById(Number(p));
    if (ref) return site.urlIn(ref, targetLang) + hash;
  }

  let ref: ContentRef | undefined;
  const [a, b, c, d] = segments;
  if (a === 'blog' && b) ref = site.find('post', b) ?? site.find(undefined, b);
  else if ((a === 'projekte' || a === 'project' || a === 'projekt' || a === 'projects') && b) ref = site.find('project', b) ?? site.find(undefined, b);
  else if (a && /^\d{4}$/.test(a) && b && /^\d{2}$/.test(b) && c && /^\d{2}$/.test(c) && d) ref = site.find('post', d);
  else if (a && segments.length === 1 && !(a in STATIC_PAGES)) ref = site.find(undefined, a);
  if (ref) return site.urlIn(ref, targetLang) + hash;

  if (a === 'produkt' && b === 'aqqa-bag') return localize('/filtersysteme/aqqabag/', targetLang);
  if (a === 'produkt' && b === 'aqqa-cube') return localize('/filtersysteme/aqqacube/', targetLang);
  if (a === 'shop' || a === 'produkt' || a === 'warenkorb') return 'https://shop.wewater.org/';

  const key = segments.join('/');
  const page = STATIC_PAGES[key];
  if (page !== undefined) return localize(page, targetLang) + hash;

  warn('links', `${ctx.where}: unknown internal link kept as path: ${href}`);
  return localize(`/${key}${key ? '/' : ''}`, targetLang) + hash;
}

/** Encode a URL for a Markdown link destination. */
export function markdownDestination(url: string): string {
  return url.replace(/ /g, '%20').replace(/\(/g, '%28').replace(/\)/g, '%29').replace(/</g, '%3C').replace(/>/g, '%3E');
}
