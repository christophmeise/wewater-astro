import type { Locale } from './locales';

/** One UI string in all three languages. All three are required. */
export type Translated = Record<Locale, string>;

/**
 * Declare a group of UI strings. Every key must have de, en and fr;
 * TypeScript fails the build if one is missing.
 */
export function defineStrings<const T extends Record<string, Translated>>(strings: T): T {
  return strings;
}
