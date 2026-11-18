import de, { type Dictionary, type UiKey } from './de';
import en from './en';
import fr from './fr';

export const LOCALES = ['de', 'en', 'fr'] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = 'de';

/** BCP 47 tags for <html lang> and hreflang. */
export const LOCALE_TAGS: Record<Locale, string> = { de: 'de', en: 'en', fr: 'fr' };

const dictionaries: Record<Locale, Dictionary> = { de, en, fr };

export function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && (LOCALES as readonly string[]).includes(value);
}

/** Locale of the current page; falls back to German. Pass Astro.currentLocale. */
export function getLocale(current: string | undefined): Locale {
  return isLocale(current) ? current : DEFAULT_LOCALE;
}

/** Translator bound to one locale: const t = useTranslations(locale); t('site.name') */
export function useTranslations(locale: Locale) {
  return (key: UiKey): string => dictionaries[locale][key];
}

/**
 * Prefix a German path with the locale: localizePath('/spenden/', 'en') -> '/en/spenden/'.
 * Paths must start and end with '/'.
 */
export function localizePath(path: string, locale: Locale): string {
  if (!path.startsWith('/')) throw new Error(`localizePath expects an absolute path, got "${path}"`);
  return locale === DEFAULT_LOCALE ? path : `/${locale}${path}`;
}

/** Strip a leading /en/ or /fr/ from a pathname: '/en/spenden/' -> '/spenden/'. */
export function unlocalizePath(pathname: string): string {
  const match = pathname.match(/^\/(en|fr)(\/.*)$/);
  return match?.[2] ?? pathname;
}

/**
 * getStaticPaths() result for pages that exist in every language with the same slug.
 * Use in src/pages/[...lang]/<page>.astro.
 */
export function localeStaticPaths() {
  return LOCALES.map((locale) => ({
    params: { lang: locale === DEFAULT_LOCALE ? undefined : locale },
  }));
}
