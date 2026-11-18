/**
 * Registry of all UI string groups. Add one import + one spread per group file.
 * Keys must be unique across groups; prefix them with the group name (e.g. 'nav.donate').
 */
import aqqabag from './aqqabag';
import aqqacube from './aqqacube';
import aqqasystem from './aqqasystem';
import common from './common';
import filtersystem from './filtersystem';
import footer from './footer';
import legal from './legal';
import nav from './nav';
import spenden from './spenden';
import tutorials from './tutorials';
import unterstuetzen from './unterstuetzen';

export const strings = {
  ...common,
  ...nav,
  ...footer,
  ...spenden,
  ...filtersystem,
  ...aqqabag,
  ...aqqacube,
  ...aqqasystem,
  ...tutorials,
  ...unterstuetzen,
  ...legal,
};

export type UiKey = keyof typeof strings;
