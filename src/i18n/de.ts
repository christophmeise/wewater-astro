/**
 * German UI strings (source language). Every key here must also exist in en.ts and fr.ts;
 * TypeScript fails the build if one is missing.
 * Page content (posts, projects, team, FAQ) lives in src/content, not here.
 */
const de = {
  'site.name': 'WeWater',
  'site.description':
    'WeWater bringt sauberes Trinkwasser dorthin, wo es fehlt: mit einfachen Wasserfiltern, Workshops und Projekten mit lokalen Partnern.',
  'a11y.skipToContent': 'Zum Inhalt springen',
  'lang.de': 'Deutsch',
  'lang.en': 'English',
  'lang.fr': 'Français',
  'home.title': 'Sauberes Trinkwasser für alle',
};

export default de;
export type UiKey = keyof typeof de;
export type Dictionary = Record<UiKey, string>;
