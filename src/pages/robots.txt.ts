import type { APIRoute } from 'astro';
import { allowIndexing } from '@/lib/indexing';

/**
 * robots.txt. Builds that must not be indexed (see src/lib/indexing.ts) still allow crawling:
 * search engines have to fetch a page to see its noindex tag and X-Robots-Tag header.
 */
export const GET: APIRoute = ({ site }) => {
  const body = allowIndexing
    ? `User-agent: *\nAllow: /\n\nSitemap: ${new URL('sitemap-index.xml', site).href}\n`
    : 'User-agent: *\nAllow: /\n';
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
