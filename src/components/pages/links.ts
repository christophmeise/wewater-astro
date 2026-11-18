/**
 * Fixed link targets of the static pages (Spenden, Filtersysteme, Unterstützen), in one place.
 *
 * DOCS: aliases into src/data/docs.ts, the single list of PDFs in public/docs/.
 * To replace a document (e.g. a new Satzung), change it there.
 */
import { docs } from '@/data/docs';

export const DOCS = {
  /** Bestätigung über Zuwendungen (simplified donation receipt for the tax office). */
  donationReceipt: docs.zuwendungsbestaetigung,
  /** Satzung (articles of association). */
  statute: docs.satzung,
  /** BCS laboratory certificate for the bacteria retention rate (AQQAbag membrane). */
  bcsCertificate: docs.bcsZertifikat,
  /** AQQAbag instructions, German and English. */
  aqqabagManualDe: docs.aqqabagAnleitungDe,
  aqqabagManualEn: docs.aqqabagInstructionsEn,
  /** AQQAcube cleaning / disinfection instructions, German and English. */
  aqqacubeManualDe: docs.aqqacubeReinigungDe,
  aqqacubeManualEn: docs.aqqacubeDisinfectionEn,
  /** Which kinds of dirty water the AQQAcube can handle. */
  aqqacubeParticles: docs.aqqacubePartikel,
} as const;

/** WeWater's donation account (also shown in the footer). */
export const BANK = {
  holder: 'WeWater gUG',
  bank: 'Bank für Sozialwirtschaft',
  iban: 'DE90 3702 0500 0001 6026 01',
  bic: 'BFSWDE33XXX',
} as const;

/** betterplace donation form of the WeWater project (same URL and options as the old site). German UI. */
export const BETTERPLACE_FORM_URL =
  'https://www.betterplace.org/de/donate/iframe/projects/68773?background_color=ffffff&color=5ABEE6&donation_amount=20&bottom_logo=true&default_payment_method=&default_interval=single&utm_campaign=external_donation_forms';

/** PayPal hosted donate button (one-off and monthly donations). */
export const PAYPAL_HOSTED_BUTTON_ID = 'E6362KW22CKHG';

export const SOCIAL = {
  facebook: 'https://www.facebook.com/wewater.org/',
  instagram: 'https://www.instagram.com/wewater_org/',
} as const;

export const CONTACT_EMAIL = 'hi@wewater.org';

/** betterplace form URL in the reader's language (betterplace offers German and English). */
export function betterplaceFormUrl(locale: 'de' | 'en' | 'fr'): string {
  return locale === 'de' ? BETTERPLACE_FORM_URL : BETTERPLACE_FORM_URL.replace('/de/donate/', '/en/donate/');
}
