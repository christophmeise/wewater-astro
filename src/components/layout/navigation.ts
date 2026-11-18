/**
 * Main navigation, shared by the desktop header (Header.astro) and the mobile menu (MobileMenu.astro).
 * Paths are German paths; components localise them with localizePath().
 */
import aqqabagIcon from '@/assets/site/filter-aqqabag.svg';
import aqqacubeIcon from '@/assets/site/filter-aqqacube.svg';
import aqqasystemIcon from '@/assets/site/filter-aqqasystem.svg';
import { unlocalizePath, type UiKey } from '@/i18n';

export const SHOP_URL = 'https://shop.wewater.org/';
export const DONATE_PATH = '/spenden/';

export interface SubNavItem {
  label: UiKey;
  description: UiKey;
  path: string;
  /** White line icon shown in a blue circle in the desktop mega-menu. */
  icon?: { src: string } | undefined;
}

export interface NavItem {
  label: UiKey;
  /** Internal German path, or an absolute URL for external links. */
  path: string;
  external?: boolean | undefined;
  /** Other path prefixes that mark this item as the current section. */
  sectionPaths?: string[] | undefined;
  children?: SubNavItem[] | undefined;
}

export const FILTER_SYSTEMS: SubNavItem[] = [
  { label: 'nav.filter.all', description: 'nav.filter.allText', path: '/filtersystem/' },
  { label: 'nav.filter.aqqabag', description: 'nav.filter.aqqabagText', path: '/filtersysteme/aqqabag/', icon: aqqabagIcon },
  { label: 'nav.filter.aqqacube', description: 'nav.filter.aqqacubeText', path: '/filtersysteme/aqqacube/', icon: aqqacubeIcon },
  {
    label: 'nav.filter.aqqasystem',
    description: 'nav.filter.aqqasystemText',
    path: '/filtersysteme/aqqasystem/',
    icon: aqqasystemIcon,
  },
  { label: 'nav.filter.tutorials', description: 'nav.filter.tutorialsText', path: '/filtersysteme/tutorials/' },
];

export const NAV_ITEMS: NavItem[] = [
  { label: 'nav.filtersystems', path: '/filtersystem/', sectionPaths: ['/filtersysteme/'], children: FILTER_SYSTEMS },
  { label: 'nav.donate', path: '/spenden/' },
  { label: 'nav.team', path: '/team/' },
  { label: 'nav.projects', path: '/projekte/' },
  { label: 'nav.blog', path: '/blog/' },
  { label: 'nav.shop', path: SHOP_URL, external: true },
];

/**
 * How a link relates to the current page, independent of the language prefix:
 * 'page' = it is the current page, 'section' = the current page lies below it
 * (e.g. /en/blog/some-post/ for "Blog"), undefined = unrelated.
 */
export function linkState(
  currentPathname: string,
  path: string,
  sectionPaths: string[] = [],
): 'page' | 'section' | undefined {
  if (/^https?:/.test(path)) return undefined;
  const current = unlocalizePath(currentPathname);
  if (current === path) return 'page';
  if (path !== '/' && current.startsWith(path)) return 'section';
  if (sectionPaths.some((prefix) => current.startsWith(prefix))) return 'section';
  return undefined;
}
