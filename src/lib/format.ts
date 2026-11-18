/**
 * Formatting helpers for dates and numbers in the page language.
 */
import type { Locale } from '@/i18n';

const dateFormats = new Map<string, Intl.DateTimeFormat>();

/** "3. Februar 2020" / "February 3, 2020" / "3 février 2020" (Berlin time, as published). */
export function formatDate(date: Date, locale: Locale): string {
  let format = dateFormats.get(locale);
  if (!format) {
    format = new Intl.DateTimeFormat(locale, { dateStyle: 'long', timeZone: 'Europe/Berlin' });
    dateFormats.set(locale, format);
  }
  return format.format(date);
}
