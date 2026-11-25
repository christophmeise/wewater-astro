/**
 * Whether search engines may index this build.
 *
 * - Netlify deploy previews and branch deploys (CONTEXT other than "production"): never.
 * - SITE_NOINDEX=true: never. Set in netlify.toml while the new site runs as preview.wewater.org
 *   next to the live site, so it can't compete with wewater.org in search. Remove it at cutover.
 * - Local builds and CI: yes, so Lighthouse checks the real SEO tags.
 *
 * Read at build time by Seo.astro (robots meta, canonical), robots.txt and astro.config.mjs
 * (X-Robots-Tag header).
 */
const context = process.env['CONTEXT'];

export const allowIndexing =
  (!context || context === 'production') && process.env['SITE_NOINDEX'] !== 'true';
