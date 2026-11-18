/** Small text helpers: entities, plain text, slugs, MDX-safe strings. */

const NAMED: Record<string, string> = {
  amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: '\u00a0', hellip: '…', ndash: '–', mdash: '—',
  lsquo: '‘', rsquo: '’', sbquo: '‚', ldquo: '“', rdquo: '”', bdquo: '„', laquo: '«', raquo: '»', euro: '€',
  auml: 'ä', ouml: 'ö', uuml: 'ü', Auml: 'Ä', Ouml: 'Ö', Uuml: 'Ü', szlig: 'ß', eacute: 'é', egrave: 'è',
  ecirc: 'ê', agrave: 'à', acirc: 'â', ccedil: 'ç', ocirc: 'ô', icirc: 'î', ucirc: 'û', copy: '©', reg: '®',
  trade: '™', deg: '°', middot: '·', bull: '•', times: '×', shy: '',
};

export function decodeEntities(input: string): string {
  return input.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (match, code: string) => {
    if (code[0] === '#') {
      const n = code[1] === 'x' || code[1] === 'X' ? parseInt(code.slice(2), 16) : parseInt(code.slice(1), 10);
      return Number.isFinite(n) ? String.fromCodePoint(n) : match;
    }
    return NAMED[code] ?? match;
  });
}

/** Strip tags, decode entities, collapse whitespace (non-breaking spaces become normal spaces). */
export function htmlToText(html: string): string {
  return decodeEntities(
    html
      .replace(/<br\s*\/?>/gi, ' ')
      .replace(/<\/(p|div|li|h\d)>/gi, ' ')
      .replace(/<[^>]+>/g, ''),
  )
    .replace(/[\u00a0\s]+/g, ' ')
    .trim();
}

/** WP excerpt to plain text without the trailing "[…]". */
export function excerptText(html: string | null | undefined): string {
  if (!html) return '';
  return htmlToText(html.replace(/<a[^>]*class="more-link"[\s\S]*?<\/a>/g, ''))
    .replace(/\s*(\[…\]|\[\.\.\.\])\s*$/u, '…')
    .replace(/\s*Weiterlesen\s*$/u, '')
    .trim();
}

/** Shorten to at most `max` characters at a word boundary, adding an ellipsis. */
export function truncate(text: string, max = 158): string {
  if (text.length <= max) return text;
  const cut = text.slice(0, max - 1);
  const lastSpace = cut.lastIndexOf(' ');
  return `${(lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut).replace(/[\s,;:.–-]+$/u, '')}…`;
}

/** Same algorithm family as github-slugger (used by Astro for heading ids). */
export function slugifyHeading(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}\p{M}\s_-]/gu, '')
    .replace(/\s/g, '-');
}

/**
 * A JSX attribute for MDX: name="value" when that is safe, otherwise name={"json"}.
 */
export function jsxAttr(name: string, value: string | number | boolean | undefined): string {
  if (value === undefined) return '';
  if (typeof value === 'number' || typeof value === 'boolean') return ` ${name}={${String(value)}}`;
  if (/["\\&\n\r{}<>]/.test(value)) return ` ${name}={${JSON.stringify(value)}}`;
  return ` ${name}="${value}"`;
}

/** Humanise a media file title like "arche-nova-logo" -> "arche nova logo". */
export function humanizeFileTitle(title: string | null | undefined): string | undefined {
  if (!title) return undefined;
  const t = title.replace(/[-_]+/g, ' ').replace(/\s+/g, ' ').trim();
  // Camera/phone file names carry no meaning.
  if (/^(img|dsc|dscn|dji|pxl|wa|whatsapp|image|bild|photo|foto|screenshot|bildschirmfoto)\b/i.test(t)) return undefined;
  if (/^[\d\s]+$/.test(t) || /^[0-9a-f]{8} [0-9a-f]{4}/i.test(t)) return undefined;
  return t;
}
