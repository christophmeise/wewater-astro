import { defineStrings } from '../define';

/**
 * Projects overview (/projekte/) and project pages. Status labels ("In Arbeit") and
 * "Projektupdates im Blog" are in content.ts.
 */
export default defineStrings({
  'projekte.title': { de: 'Projekte', en: 'Projects', fr: 'Projets' },
  'projekte.description': {
    de: 'WeWater ist in Kenia, Uganda, der DR Kongo und weiteren Ländern aktiv und setzt dort Trinkwasserprojekte um. Hier findest du eine Übersicht aller Projekte für mehr sauberes Trinkwasser.',
    en: 'WeWater operates in Kenya, Uganda, the DR Congo and other countries and implements drinking water projects there. This page provides an overview of all projects for more clean drinking water.',
    fr: "WeWater opère au Kenya, en Ouganda, en RD Congo et dans d'autres pays et y met en œuvre des projets d'eau potable. Cette page donne une vue d'ensemble de tous nos projets pour plus d'eau potable.",
  },
  'projekte.eyebrow': { de: 'Projekte von WeWater', en: 'WeWater projects', fr: 'Projets de WeWater' },
  'projekte.heading': { de: 'Projektübersicht', en: 'Project overview', fr: 'Aperçu des projets' },
  'projekte.filter.legend': { de: 'Projekte filtern', en: 'Filter projects', fr: 'Filtrer les projets' },
  'projekte.filter.status': { de: 'Status', en: 'Status', fr: 'Statut' },
  'projekte.filter.system': { de: 'Filtersystem', en: 'Filter system', fr: 'Système de filtration' },
  'projekte.filter.allSystems': { de: 'Alle Systeme', en: 'All systems', fr: 'Tous les systèmes' },
  'projekte.filter.empty': {
    de: 'Für diese Auswahl gibt es noch keine Projekte.',
    en: 'There are no projects for this selection yet.',
    fr: "Il n'y a pas encore de projets pour cette sélection.",
  },
  'projekte.overview': { de: 'Zur Projektübersicht', en: 'To the project overview', fr: "Vers l'aperçu des projets" },
  'projekte.allProjects': { de: 'Alle Projekte', en: 'All projects', fr: 'Tous les projets' },
});
