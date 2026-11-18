/**
 * Small inline flag images for the language switcher (as on the old site; English used the US flag).
 * Flag colours are part of the image, not design tokens.
 */
import type { Locale } from '@/i18n';

export const FLAGS: Record<Locale, { viewBox: string; body: string }> = {
  de: {
    viewBox: '0 0 5 3',
    body: '<rect width="5" height="3" fill="#ffce00"/><rect width="5" height="2" fill="#dd0000"/><rect width="5" height="1" fill="#000000"/>',
  },
  en: {
    viewBox: '0 0 16 13',
    body: '<rect width="16" height="13" fill="#ffffff"/><path d="M0 0h16v1H0zm0 2h16v1H0zm0 2h16v1H0zm0 2h16v1H0zm0 2h16v1H0zm0 2h16v1H0zm0 2h16v1H0z" fill="#b22234"/><rect width="7" height="7" fill="#3c3b6e"/>',
  },
  fr: {
    viewBox: '0 0 3 2',
    body: '<rect width="3" height="2" fill="#ef4135"/><rect width="2" height="2" fill="#ffffff"/><rect width="1" height="2" fill="#0055a4"/>',
  },
};
