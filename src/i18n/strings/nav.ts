import { defineStrings } from '../define';

/** Header, mega-menu, mobile menu and language switcher. Texts ported from the old translation.json. */
export default defineStrings({
  'nav.label': { de: 'Hauptnavigation', en: 'Main navigation', fr: 'Navigation principale' },
  'nav.home': { de: 'WeWater Startseite', en: 'WeWater home page', fr: "Page d'accueil WeWater" },
  'nav.filtersystems': { de: 'Filtersysteme', en: 'Filter systems', fr: 'Systèmes de filtration' },
  'nav.donate': { de: 'Spenden', en: 'Donate', fr: 'Faire un don' },
  'nav.team': { de: 'Team', en: 'Team', fr: 'Équipe' },
  'nav.projects': { de: 'Projekte', en: 'Projects', fr: 'Projets' },
  'nav.blog': { de: 'Blog', en: 'Blog', fr: 'Blog' },
  'nav.shop': { de: 'Shop', en: 'Shop', fr: 'Shop' },
  'nav.cta': { de: 'Ich will helfen!', en: 'I want to help!', fr: 'Je veux aider !' },
  'nav.newTab': { de: '(öffnet in neuem Tab)', en: '(opens in a new tab)', fr: '(s’ouvre dans un nouvel onglet)' },

  // Mega-menu "Filtersysteme"
  'nav.filter.all': { de: 'Alle Filtersysteme', en: 'All filter systems', fr: 'Tous les systèmes de filtration' },
  'nav.filter.allText': {
    de: 'Übersicht aller Entwicklungen',
    en: 'Overview of all developments',
    fr: 'Aperçu de tous les développements',
  },
  'nav.filter.aqqabag': { de: 'AQQAbag', en: 'AQQAbag', fr: 'AQQAbag' },
  'nav.filter.aqqabagText': {
    de: 'Lösung für Einzelpersonen',
    en: 'Solution for individuals',
    fr: 'Solution pour les particuliers',
  },
  'nav.filter.aqqacube': { de: 'AQQAcube', en: 'AQQAcube', fr: 'AQQAcube' },
  'nav.filter.aqqacubeText': {
    de: 'Sofortlösung für Lebensgemeinschaften',
    en: 'Instant solution for communities',
    fr: 'Solution immédiate pour les couples qui cohabitent',
  },
  'nav.filter.aqqasystem': { de: 'AQQAsystem', en: 'AQQAsystem', fr: 'AQQAsystem' },
  'nav.filter.aqqasystemText': {
    de: 'Lösung für den langfristigen Einsatz',
    en: 'Solution for long-term use',
    fr: 'Solution pour une utilisation à long terme',
  },
  'nav.filter.tutorials': { de: 'Zu den Tutorials', en: 'To the tutorials', fr: 'Aux tutoriels' },
  'nav.filter.tutorialsText': {
    de: 'Wir erklären unsere Lösungen',
    en: 'We explain our solutions',
    fr: 'Nous expliquons nos solutions',
  },

  // Mobile menu toggle (constant name; its state is announced via aria-expanded)
  'nav.menu': { de: 'Menü', en: 'Menu', fr: 'Menu' },

  // Language switcher
  'nav.language': { de: 'Sprache', en: 'Language', fr: 'Langue' },
});
