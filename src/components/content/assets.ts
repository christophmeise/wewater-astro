/**
 * Resolve image paths used in MDX ("wp/2026/11/foo.jpg", relative to src/assets/) to imported
 * images, so <Figure>/<Gallery>/<Video> can take plain strings and Astro still optimises them.
 * A path that does not exist fails the build with a clear message.
 */
import type { ImageMetadata } from 'astro';

const images = import.meta.glob<{ default: ImageMetadata }>(
  '/src/assets/**/*.{jpg,jpeg,png,webp,gif,avif,JPG,JPEG,PNG,WEBP,GIF}',
);

export type ImageSource = string | ImageMetadata;

export async function resolveImage(src: ImageSource): Promise<ImageMetadata> {
  if (typeof src !== 'string') return src;
  const rel = src.replace(/^\/?(src\/)?assets\//, '');
  const load = images[`/src/assets/${rel}`];
  if (!load) {
    throw new Error(`Image not found: src/assets/${rel}. Images used in content must be files in src/assets/.`);
  }
  return (await load()).default;
}

/** Responsive widths for content images (Astro generates one WebP per width). */
export const CONTENT_WIDTHS = [480, 800, 1200, 1600];

/** Content column: full width on phones, at most the 1200px page container. */
export const CONTENT_SIZES = '(min-width: 75rem) 75rem, 100vw';
