import type { APIRoute } from 'astro';

/**
 * robots.txt. Netlify sets CONTEXT to "production", "deploy-preview" or "branch-deploy";
 * only production may be indexed.
 */
export const GET: APIRoute = ({ site }) => {
  const isProduction = !process.env['CONTEXT'] || process.env['CONTEXT'] === 'production';
  const body = isProduction
    ? `User-agent: *\nAllow: /\n\nSitemap: ${new URL('sitemap-index.xml', site).href}\n`
    : 'User-agent: *\nDisallow: /\n';
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
