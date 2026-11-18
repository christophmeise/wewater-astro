/**
 * Registry of all UI string groups. Add one import + one spread per group file.
 * Keys must be unique across groups; prefix them with the group name (e.g. 'nav.donate').
 */
import common from './common';
import content from './content';

export const strings = {
  ...common,
  ...content,
};

export type UiKey = keyof typeof strings;
