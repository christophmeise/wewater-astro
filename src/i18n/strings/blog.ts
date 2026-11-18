import { defineStrings } from '../define';

/**
 * Blog index (/blog/) and blog post pages. Post texts (by, reading time, author box, comments)
 * are in content.ts.
 */
export default defineStrings({
  'blog.title': { de: 'Blog', en: 'Blog', fr: 'Blog' },
  'blog.description': {
    de: 'Alle Updates zur Arbeit der NGO WeWater, über unsere Trinkwasserprojekte und aktuelle Entwicklungen findest du gebündelt im WeWater Blog.',
    en: 'All the updates about the work of the NGO WeWater, about our drinking water projects as well as other current developments can be found bundled on the WeWater Blog.',
    fr: "Toutes les mises à jour sur le travail de l'ONG WeWater, sur nos projets d'eau potable et tous les développements actuels sont à trouver sur le blog WeWater.",
  },
  'blog.eyebrow': { de: 'News von WeWater', en: 'WeWater news', fr: 'Nouvelles de WeWater' },
  'blog.heading': { de: 'Neuigkeiten', en: 'News', fr: 'Dernières nouvelles' },
  'blog.morePosts': { de: 'Weitere Beiträge', en: 'More posts', fr: "Plus d'articles" },
  'blog.allPosts': { de: 'Alle Blogeinträge', en: 'All blog posts', fr: 'Tous les articles du blog' },
  'blog.categories': { de: 'Kategorien', en: 'Categories', fr: 'Catégories' },
  'blog.comment': { de: 'Kommentar', en: 'Comment', fr: 'Commentaire' },
});
