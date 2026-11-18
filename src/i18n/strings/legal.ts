import { defineStrings } from '../define';

/**
 * Impressum, Datenschutz (German-only legal texts) and the 404 page.
 */
export default defineStrings({
  // /impressum/ and /dataprotection/: the legal texts themselves are German-only and live in the pages.
  'legal.imprint.title': { de: 'Impressum', en: 'Imprint', fr: 'Mentions légales' },
  'legal.imprint.description': {
    de: 'Impressum der WeWater gemeinnützige UG (haftungsbeschränkt).',
    en: 'Imprint of WeWater gemeinnützige UG (haftungsbeschränkt).',
    fr: 'Mentions légales de WeWater gemeinnützige UG (haftungsbeschränkt).',
  },
  'legal.privacy.title': { de: 'Datenschutzerklärung', en: 'Privacy Policy', fr: 'Protection des données' },
  'legal.privacy.description': {
    de: 'Datenschutzerklärung der WeWater gemeinnützige UG: welche Daten beim Besuch dieser Website verarbeitet werden.',
    en: 'Privacy policy of WeWater gemeinnützige UG: which data is processed when you visit this website.',
    fr: 'Politique de confidentialité de WeWater gemeinnützige UG : quelles données sont traitées lors de la visite de ce site.',
  },
  'legal.germanOnly': {
    de: 'Dieser Rechtstext ist nur auf Deutsch verfügbar.',
    en: 'This legal text is only available in German.',
    fr: "Ce texte juridique n'est disponible qu'en allemand.",
  },

  // 404 page (one page for every language: Netlify serves /404.html for all unknown URLs)
  'notFound.title': { de: 'Seite nicht gefunden', en: 'Page not found', fr: 'Page introuvable' },
  'notFound.text': {
    de: 'Diese Seite gibt es nicht (mehr).',
    en: 'This page does not exist (anymore).',
    fr: "Cette page n'existe pas (ou plus).",
  },
  'notFound.home': { de: 'Zur Startseite', en: 'Go to the home page', fr: "Aller à la page d'accueil" },
});
