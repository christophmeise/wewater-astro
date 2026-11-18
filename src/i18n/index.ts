import { LOCALES, DEFAULT_LOCALE, type Locale } from './locales';
import { strings, type UiKey } from './strings';

export { LOCALES, DEFAULT_LOCALE, type Locale, type UiKey };

/** BCP 47 tags for <html lang> and hreflang. */
export const LOCALE_TAGS: Record<Locale, string> = { de: 'de', en: 'en', fr: 'fr' };

export function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && (LOCALES as readonly string[]).includes(value);
}

/** Locale of the current page; falls back to German. Pass Astro.currentLocale. */
export function getLocale(current: string | undefined): Locale {
  return isLocale(current) ? current : DEFAULT_LOCALE;
}

/** Translator bound to one locale: const t = useTranslations(locale); t('site.name') */
export function useTranslations(locale: Locale) {
  return (key: UiKey): string => strings[key][locale];
}

/**
 * Prefix a German path with the locale: localizePath('/spenden/', 'en') -> '/en/spenden/'.
 * Paths must start with '/'.
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
