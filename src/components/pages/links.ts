/**
 * Fixed link targets of the static pages (Spenden, Filtersysteme, Unterstützen), in one place.
 *
 * DOCS: PDFs in public/docs/ (served as-is). When a document is replaced (e.g. a new Satzung),
 * put the PDF into public/docs/ and change the path here.
 */
export const DOCS = {
  /** Bestätigung über Zuwendungen (simplified donation receipt for the tax office). */
  donationReceipt: '/docs/Bestaetigung_ueber_Zuwendungen_fuer_Finanzamt_WeWater_11_26.pdf',
  /** Satzung (articles of association). */
  statute: '/docs/Satzung_WeWater_2026.pdf',
  /** BCS laboratory certificate for the bacteria retention rate (AQQAbag membrane). */
  bcsCertificate: '/docs/WW09232019-BCS-1909302-303p.pdf',
  /** AQQAbag instructions, German and English. */
  aqqabagManualDe: '/docs/anleitung_aqqabag.pdf',
  aqqabagManualEn: '/docs/aqqabag_instructions.pdf',
  /** AQQAcube cleaning / disinfection instructions, German and English. */
  aqqacubeManualDe: '/docs/reinigung_aqqacube_DE.pdf',
  aqqacubeManualEn: '/docs/disinfection_aqqacube_EN.pdf',
  /** Which kinds of dirty water the AQQAcube can handle. */
  aqqacubeParticles: '/docs/AQQAcube_Partikel.pdf',
} as const;

/** WeWater's donation account (also shown in the footer). */
export const BANK = {
  holder: 'WeWater gUG',
  bank: 'Bank für Sozialwirtschaft',
  iban: 'DE90 3702 0500 0001 6026 01',
  bic: 'BFSWDE33XXX',
} as const;

/** betterplace donation form of the WeWater project (same URL and options as the old site). */
export const BETTERPLACE_FORM_URL =
  'https://www.betterplace.org/de/donate/iframe/projects/68773?background_color=ffffff&color=5ABEE6&donation_amount=20&bottom_logo=true&default_payment_method=&default_interval=single&utm_campaign=external_donation_forms';

/** PayPal hosted donate button (one-off and monthly donations). */
export const PAYPAL_HOSTED_BUTTON_ID = 'E6362KW22CKHG';

export const SOCIAL = {
  facebook: 'https://www.facebook.com/wewater.org/',
  instagram: 'https://www.instagram.com/wewater_org/',
} as const;

export const CONTACT_EMAIL = 'hi@wewater.org';
