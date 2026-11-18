/**
 * Registry of all UI string groups. Add one import + one spread per group file.
 * Keys must be unique across groups; prefix them with the group name (e.g. 'nav.donate').
 */
import aqqabag from './aqqabag';
import aqqacube from './aqqacube';
import aqqasystem from './aqqasystem';
import blog from './blog';
import common from './common';
import content from './content';
import filtersystem from './filtersystem';
import faq from './faq';
import footer from './footer';
import legal from './legal';
import nav from './nav';
import spenden from './spenden';
import tutorials from './tutorials';
import unterstuetzen from './unterstuetzen';
import newsletter from './newsletter';
import presse from './presse';
import team from './team';
import home from './home';
import projekte from './projekte';

export const strings = {
  ...common,
  ...nav,
  ...footer,
  ...content,
  ...spenden,
  ...filtersystem,
  ...aqqabag,
  ...aqqacube,
  ...aqqasystem,
  ...tutorials,
  ...unterstuetzen,
  ...legal,
  ...team,
  ...faq,
  ...newsletter,
  ...presse,
  ...home,
  ...blog,
  ...projekte,
};

export type UiKey = keyof typeof strings;
