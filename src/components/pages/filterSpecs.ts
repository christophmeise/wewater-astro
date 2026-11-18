/**
 * Spec sheet of the three filter systems, shared by the comparison table on /filtersystem/ and the
 * tables on the product pages, so both always show the same values.
 * Labels and values are UI strings in src/i18n/strings/filtersystem.ts; the PDFs are in ./links.ts.
 *
 *   const rows = filterSpecRows(t, 'aqqacube');          // one product (product page)
 *   const rows = filterComparisonRows(t);                // all three (overview)
 */
import type { UiKey } from '@/i18n';
import { DOCS } from './links';

export type FilterSystem = 'aqqabag' | 'aqqacube' | 'aqqasystem';
type T = (key: UiKey) => string;
type Row = 'use' | 'users' | 'quantity' | 'innovation' | 'cost' | 'weight' | 'retention' | 'durability' | 'manual';

const ROW_LABELS: Record<Row, UiKey> = {
  use: 'filtersystem.spec.use',
  users: 'filtersystem.spec.users',
  quantity: 'filtersystem.spec.quantity',
  innovation: 'filtersystem.spec.innovation',
  cost: 'filtersystem.spec.cost',
  weight: 'filtersystem.spec.weight',
  retention: 'filtersystem.spec.retention',
  durability: 'filtersystem.spec.durability',
  manual: 'filtersystem.spec.manual',
};

const escape = (text: string) => text.replaceAll('&', '&amp;').replaceAll('<', '&lt;');
const link = (href: string, text: string) => `<a href="${href}" class="link-inline">${escape(text)}</a>`;

/** Value cells (HTML) per system. `undefined` = the row is not shown for this system. */
function values(t: T, system: FilterSystem, context: 'page' | 'comparison'): Partial<Record<Row, string | undefined>> {
  const retention = `${escape(t('filtersystem.spec.retentionValue'))} (${link(DOCS.bcsCertificate, t('filtersystem.spec.certified'))})`;
  const manual = (de: string, en: string) =>
    `${link(de, t('filtersystem.spec.manualGerman'))} / ${link(en, t('filtersystem.spec.manualEnglish'))} (PDF)`;
  const text = (key: UiKey) => escape(t(key));

  switch (system) {
    case 'aqqabag':
      return {
        use: text('filtersystem.bag.use'),
        users: text('filtersystem.bag.users'),
        quantity: text('filtersystem.bag.quantity'),
        innovation: text('filtersystem.spec.membrane'),
        cost: text('filtersystem.bag.cost'),
        retention,
        durability: text('filtersystem.bag.durability'),
        manual: manual(DOCS.aqqabagManualDe, DOCS.aqqabagManualEn),
      };
    case 'aqqacube':
      return {
        use: text('filtersystem.cube.use'),
        users: text(context === 'page' ? 'filtersystem.cube.usersExamples' : 'filtersystem.cube.users'),
        quantity: text('filtersystem.cube.quantity'),
        innovation: text('filtersystem.spec.membrane'),
        cost: text('filtersystem.cube.cost'),
        weight: context === 'page' ? text('filtersystem.cube.weight') : undefined,
        retention,
        durability: text('filtersystem.cube.durability'),
        manual: manual(DOCS.aqqacubeManualDe, DOCS.aqqacubeManualEn),
      };
    case 'aqqasystem':
      return {
        use: text('filtersystem.system.use'),
        users: text('filtersystem.system.users'),
        quantity: text('filtersystem.system.quantity'),
        innovation: text('filtersystem.spec.membrane'),
        cost: text('filtersystem.system.sizeDependent'),
        weight: context === 'page' ? text('filtersystem.system.sizeDependent') : undefined,
        retention,
        durability: text('filtersystem.system.durability'),
        manual: context === 'comparison' ? '–' : undefined,
      };
  }
}

const ORDER: Row[] = ['use', 'users', 'quantity', 'innovation', 'cost', 'weight', 'retention', 'durability', 'manual'];

/** Rows for one system's spec table (product page). */
export function filterSpecRows(t: T, system: FilterSystem) {
  const v = values(t, system, 'page');
  return ORDER.filter((row) => v[row] !== undefined).map((row) => ({ label: t(ROW_LABELS[row]), values: [v[row]!] }));
}

/** Rows for the comparison table of all three systems (overview page). */
export function filterComparisonRows(t: T) {
  const systems: FilterSystem[] = ['aqqabag', 'aqqacube', 'aqqasystem'];
  const all = systems.map((system) => values(t, system, 'comparison'));
  return ORDER.filter((row) => all.some((v) => v[row] !== undefined)).map((row) => ({
    label: t(ROW_LABELS[row]),
    values: all.map((v) => v[row] ?? '–'),
  }));
}
