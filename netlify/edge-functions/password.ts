/**
 * Password gate for preview.wewater.org and deploy previews until cutover.
 *
 * Netlify's built-in password protection needs a paid plan, so this edge function asks for HTTP basic
 * auth on every request instead. The password is the SITE_PASSWORD environment variable, set in the
 * Netlify UI (Project configuration > Environment variables), never in this repo. Any username is
 * accepted. Without SITE_PASSWORD the site is public. A changed password applies from the next deploy.
 *
 * AT CUTOVER: delete this file and the SITE_PASSWORD variable so wewater.org is public.
 */

// Just enough of the Netlify edge runtime's types that `astro check` needs no extra package.
declare const Netlify: { env: { get(name: string): string | undefined } };
interface Context {
  next(): Promise<Response>;
}

export default async (request: Request, context: Context): Promise<Response> => {
  const password = Netlify.env.get('SITE_PASSWORD');
  if (!password || givenPassword(request) === password) return context.next();

  return new Response('Diese Vorschau ist passwortgeschützt.\n', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="WeWater Vorschau", charset="UTF-8"',
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Robots-Tag': 'noindex',
    },
  });
};

/** The password from an `Authorization: Basic <base64 of "user:password">` header, or null. */
function givenPassword(request: Request): string | null {
  const [scheme, encoded] = (request.headers.get('authorization') ?? '').split(' ');
  if (scheme?.toLowerCase() !== 'basic' || !encoded) return null;
  try {
    const bytes = Uint8Array.from(atob(encoded), (char) => char.charCodeAt(0));
    const credentials = new TextDecoder().decode(bytes);
    const colon = credentials.indexOf(':');
    return colon === -1 ? null : credentials.slice(colon + 1);
  } catch {
    return null;
  }
}

export const config = {
  path: '/*',
  // Let's Encrypt must reach its challenge files to renew the HTTPS certificate.
  excludedPath: ['/.well-known/acme-challenge/*'],
};
