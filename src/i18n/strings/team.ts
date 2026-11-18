import { defineStrings } from '../define';

/**
 * Team page (/team/). Texts ported from the old page_team.json.
 * Link labels use {name} and {network} placeholders, filled in by the page.
 */
export default defineStrings({
  'team.title': { de: 'Das Team', en: 'The team', fr: 'L’équipe' },
  'team.description': {
    de: 'Lerne das Team hinter WeWater kennen: Gründer, Projektleiter und Community Scouts, die für sauberes Trinkwasser für Menschen in Not sorgen.',
    en: 'Meet the team behind WeWater: founders, project managers and community scouts who provide clean drinking water for people in need.',
    fr: 'Découvrez l’équipe de WeWater : fondateurs, chefs de projet et community scouts qui fournissent de l’eau potable aux personnes dans le besoin.',
  },
  'team.headline': {
    de: 'Wir machen Wasser sauber.',
    en: 'We make water clean.',
    fr: 'Nous nettoyons l’eau.',
  },
  'team.link.email': { de: 'E-Mail an {name}', en: 'Email {name}', fr: 'Écrire à {name}' },
  'team.link.website': { de: 'Website von {name}', en: 'Website of {name}', fr: 'Site web de {name}' },
  'team.link.social': { de: '{name} auf {network}', en: '{name} on {network}', fr: '{name} sur {network}' },
});
