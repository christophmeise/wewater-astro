/**
 * Registry of all UI string groups. Add one import + one spread per group file.
 * Keys must be unique across groups; prefix them with the group name (e.g. 'nav.donate').
 */
import blog from './blog';
import common from './common';
import content from './content';
import footer from './footer';
import home from './home';
import nav from './nav';
import projekte from './projekte';

export const strings = {
  ...common,
  ...nav,
  ...footer,
  ...content,
  ...home,
  ...blog,
  ...projekte,
};

export type UiKey = keyof typeof strings;
