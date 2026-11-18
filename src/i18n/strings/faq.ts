import { defineStrings } from '../define';

/**
 * FAQ page (/faq/) and its sidebar. Texts ported from the old page_faq.json and the
 * sidebar strings in translation.json ("Wer wir sind", "Spende jetzt").
 * The questions and answers themselves are content: src/content/faq/<lang>/.
 */
export default defineStrings({
  'faq.title': { de: 'FAQ', en: 'FAQ', fr: 'FAQ' },
  'faq.lead': { de: 'Häufig gestellte Fragen', en: 'Frequently asked questions', fr: 'Questions fréquemment posées' },
  'faq.description': {
    de: 'Häufig gestellte Fragen zu WeWater, unseren Wasserfiltern, Trinkwasser, Trinkwasseraufbereitung und Spenden.',
    en: 'Frequently asked questions about WeWater, our water filters, drinking water, drinking water treatment and donations.',
    fr: 'Questions fréquentes sur WeWater, nos filtres à eau, l’eau potable, le traitement de l’eau potable et les dons.',
  },
  /** Shown on /en/faq/ and /fr/faq/ while the answers are only available in German. */
  'faq.untranslated': {
    de: 'Einige Antworten gibt es bisher nur auf Deutsch.',
    en: 'Our answers are currently only available in German.',
    fr: 'Nos réponses ne sont pour l’instant disponibles qu’en allemand.',
  },

  // Sidebar
  'faq.sidebar.label': { de: 'Mehr über WeWater', en: 'More about WeWater', fr: 'En savoir plus sur WeWater' },
  'faq.about.title': { de: 'Wer wir sind', en: 'Who we are', fr: 'Qui sommes-nous' },
  'faq.about.text': {
    de: 'WeWater setzt sich für das Menschenrecht auf Trinkwasser ein. Mit unseren nachhaltigen und langlebigen Wasserfiltern haben wir fast 100.000 Menschen in Dörfern, Schulen und Krankenhäusern Zugang zu sauberem Wasser ermöglicht, der existenziellsten Lebensgrundlage.',
    en: 'WeWater stands up for the human right to drinking water. With our sustainable and long-lasting water filters, we have given almost 100,000 people in villages, schools and hospitals access to clean water, the most basic necessity of life.',
    fr: 'WeWater s’engage pour le droit humain à l’eau potable. Grâce à nos filtres à eau durables et robustes, près de 100 000 personnes dans des villages, des écoles et des hôpitaux ont accès à de l’eau propre, le plus vital des besoins.',
  },
  'faq.about.cta': { de: 'Erfahre mehr über uns', en: 'Learn more about us', fr: 'En savoir plus sur nous' },
  'faq.donate.title': { de: 'Spende jetzt', en: 'Donate now', fr: 'Faites un don' },
  'faq.donate.text': {
    de: 'Mit deiner Spende bringen wir sauberes Trinkwasser dorthin, wo es fehlt.',
    en: 'With your donation we bring clean drinking water to where it is missing.',
    fr: 'Grâce à votre don, nous apportons de l’eau potable là où elle manque.',
  },
});
