/**
 * Registry of all UI string groups. Add one import + one spread per group file.
 * Keys must be unique across groups; prefix them with the group name (e.g. 'nav.donate').
 */
import common from './common';
import content from './content';
import footer from './footer';
import nav from './nav';

export const strings = {
  ...common,
  ...nav,
  ...footer,
  ...content,
};

export type UiKey = keyof typeof strings;
