/**
 * The animated line icons (Lottie, originally lord-icons from lordicon.com) used by <AnimatedIcon>.
 *
 * Each icon is two files in src/assets/animations/:
 *   <name>.json  the Lottie animation, loaded by the player in the browser (served as a hashed URL)
 *   <name>.svg   its first frame as a static SVG: the poster rendered into the HTML
 *
 * The JSON files are the old site's lord-icon files with lordicon's colour/stroke expressions
 * replaced by their values (the light player runs no expressions, and the CSP forbids eval) and the
 * hidden lordicon helper layers removed. The poster is frame 0 of that file, rendered with the
 * same player, so the swap from poster to animation is invisible.
 */

export const ANIMATED_ICON_NAMES = [
  // Home "Innovation" tiles
  'gauge',
  'energy',
  'chemicals',
  'cheap',
  // Project detail tiles (<IntroTiles>)
  'pin',
  'map',
  'todo',
  'people',
  // Project status (<StatusChip>): in progress, completed
  'gears',
  'thumb',
] as const;

export type AnimatedIconName = (typeof ANIMATED_ICON_NAMES)[number];

const posters = import.meta.glob<string>('/src/assets/animations/*.svg', {
  query: '?raw',
  import: 'default',
  eager: true,
});
const animations = import.meta.glob<string>('/src/assets/animations/*.json', {
  query: '?url',
  import: 'default',
  eager: true,
});

export function animatedIcon(name: AnimatedIconName): { poster: string; src: string } {
  const poster = posters[`/src/assets/animations/${name}.svg`];
  const src = animations[`/src/assets/animations/${name}.json`];
  if (!poster || !src) throw new Error(`Animated icon "${name}" is missing in src/assets/animations/`);
  return { poster, src };
}

let instance = 0;

/** A prefix that keeps the poster's mask/clip ids unique when an icon is used several times on a page. */
export function nextIdPrefix(): string {
  instance += 1;
  return `ai${instance}-`;
}
