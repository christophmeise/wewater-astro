/**
 * Rich UI strings: a few strings need inline markup (bold amounts, links inside a sentence).
 * They are written with simple tags so translators see the whole sentence:
 *
 *   'Als Nachweis genügen dein Kontoauszug und <docLink>dieses Dokument</docLink>.'
 *
 * Allowed as-is: <strong>, <em>, <br>. Every other tag must be passed in `links` and becomes an <a>.
 * Render the result with set:html; the strings come from this repo, never from user input.
 *
 *   <p set:html={rich(t('spenden.taxSmall'), { docLink: { href: DOCS.receipt } })} />
 */
export interface RichLink {
  href: string;
  /** Extra words for screen readers and search engines, e.g. "(PDF)" after a short link text like "hier". */
  srSuffix?: string | undefined;
  /** Open in a new tab; appends `newTabLabel` for screen readers. */
  newTab?: boolean | undefined;
  newTabLabel?: string | undefined;
}

const ALLOWED = new Set(['strong', 'em', 'br']);

function escapeAttr(value: string) {
  return value.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;');
}

export function rich(text: string, links: Record<string, RichLink> = {}): string {
  return text.replace(/<(\/?)([a-zA-Z]+)\s*(\/?)>/g, (match, closing: string, name: string) => {
    if (ALLOWED.has(name)) return match;
    const link = links[name];
    if (!link) throw new Error(`rich(): no link given for <${name}> in "${text}"`);
    if (closing) {
      const extra = [link.srSuffix, link.newTab ? link.newTabLabel : undefined].filter(Boolean).join(' ');
      return extra ? `<span class="sr-only"> ${extra}</span></a>` : '</a>';
    }
    const target = link.newTab ? ' target="_blank" rel="noopener"' : '';
    return `<a href="${escapeAttr(link.href)}" class="link-inline"${target}>`;
  });
}
