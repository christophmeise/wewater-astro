/**
 * WordPress categories -> language-independent category keys.
 * Polylang translation groups become one key (the German slug); untranslated terms with the
 * same name are merged (e.g. "General" twice in English, "DR Kongo" in German and French).
 */
import { LANGS, type Lang } from './config.ts';
import type { WpCategory } from './wp.ts';
import { decodeEntities } from './text.ts';

export interface CategoryDef {
  key: string;
  label: Record<Lang, string>;
  color: string | undefined;
  isPress: boolean;
  status: 'in-progress' | 'completed' | undefined;
  product: 'aqqabag' | 'aqqacube' | 'aqqasystem' | undefined;
  wpIds: number[];
}

/** Labels for languages WordPress has no term for (or a German spelling in French). */
export const LABEL_FIXES: Record<string, Partial<Record<Lang, string>>> = {
  'dr-kongo': { en: 'DR Congo', fr: 'RD Congo' },
  belutschistan: { en: 'Balochistan', fr: 'Baloutchistan' },
  'uganda-projekte-2022': { en: 'Uganda Projects 2022', fr: 'Projets Ouganda 2022' },
  'kenia-projekte-2020': { fr: 'Projets Kenya 2020' },
  'kenia-projekte-2022': { en: 'Kenya Projects 2022', fr: 'Projets Kenya 2022' },
  veranstaltungen: { en: 'Events', fr: 'Événements' },
  projekte: { en: 'Projects', fr: 'Projets' },
  'aqqasystem-projekt': { fr: 'Projet AQQAsystem' },
};

const STATUS: Record<string, CategoryDef['status']> = { 'in-arbeit': 'in-progress', abgeschlossen: 'completed' };
const PRODUCT: Record<string, CategoryDef['product']> = {
  'aqqabag-projekt': 'aqqabag',
  'aqqacube-projekt': 'aqqacube',
  'aqqasystem-projekt': 'aqqasystem',
};

export class Categories {
  readonly defs = new Map<string, CategoryDef>();
  private keyById = new Map<number, string>();

  constructor(terms: WpCategory[]) {
    const parent = new Map<number, number>();
    const find = (id: number): number => {
      const p = parent.get(id) ?? id;
      if (p === id) return id;
      const root = find(p);
      parent.set(id, root);
      return root;
    };
    const union = (a: number, b: number) => {
      const ra = find(a);
      const rb = find(b);
      if (ra !== rb) parent.set(rb, ra);
    };
    for (const t of terms) for (const tr of t.translations ?? []) union(t.databaseId, tr.databaseId);
    // Same name (case-insensitive), at least one side untranslated -> same category.
    for (const a of terms) {
      if (a.translations?.length) continue;
      const twin = terms.find((b) => b !== a && b.name.trim().toLowerCase() === a.name.trim().toLowerCase());
      if (twin) union(twin.databaseId, a.databaseId);
    }

    const groups = new Map<number, WpCategory[]>();
    for (const t of terms) groups.set(find(t.databaseId), [...(groups.get(find(t.databaseId)) ?? []), t]);

    for (const members of groups.values()) {
      const byLang = (l: Lang) => members.find((m) => m.language?.slug === l);
      const keySource = byLang('de') ?? members.find((m) => !m.language) ?? byLang('en') ?? members[0];
      if (!keySource) continue;
      const key = keySource.slug;
      const anyLabel = decodeEntities(keySource.name);
      const label = Object.fromEntries(
        LANGS.map((l) => [l, LABEL_FIXES[key]?.[l] ?? (byLang(l) ? decodeEntities(byLang(l)!.name) : anyLabel)]),
      ) as Record<Lang, string>;
      const color = members.map((m) => m.description?.trim()).find((d) => d && /^#[0-9a-f]{6}$/i.test(d));
      this.defs.set(key, {
        key,
        label,
        color: color?.toUpperCase(),
        isPress: key === 'presse',
        status: STATUS[key],
        product: PRODUCT[key],
        wpIds: members.map((m) => m.databaseId),
      });
      for (const m of members) this.keyById.set(m.databaseId, key);
    }
  }

  key(wpId: number): string | undefined {
    return this.keyById.get(wpId);
  }

  get(key: string): CategoryDef | undefined {
    return this.defs.get(key);
  }
}
