import { defineStrings } from '../define';

/** Strings for blog posts, projects and the content components in src/components/content/. */
export default defineStrings({
  'content.photo': { de: 'Foto', en: 'Photo', fr: 'Photo' },
  /** Accessible name of the (sideways scrollable) box around a table in a post or project. */
  'content.table': { de: 'Tabelle', en: 'Table', fr: 'Tableau' },

  // Gallery lightbox
  'content.gallery.label': { de: 'Bildergalerie', en: 'Photo gallery', fr: 'Galerie de photos' },
  'content.gallery.open': { de: 'Foto vergrößern', en: 'Enlarge photo', fr: 'Agrandir la photo' },
  'content.gallery.close': { de: 'Schließen', en: 'Close', fr: 'Fermer' },
  'content.gallery.previous': { de: 'Vorheriges Foto', en: 'Previous photo', fr: 'Photo précédente' },
  'content.gallery.next': { de: 'Nächstes Foto', en: 'Next photo', fr: 'Photo suivante' },

  // Donation form (betterplace iframe, loaded on demand)
  'content.donation.heading': { de: 'Jetzt spenden', en: 'Donate now', fr: 'Faire un don' },
  'content.donation.text': {
    de: 'Das Spendenformular von betterplace.org lädt, sobald du hierher scrollst.',
    en: 'The betterplace.org donation form loads as soon as you scroll here.',
    fr: 'Le formulaire de don de betterplace.org se charge dès que vous faites défiler jusqu’ici.',
  },
  'content.donation.load': { de: 'Spendenformular laden', en: 'Load donation form', fr: 'Charger le formulaire de don' },
  'content.donation.widgetHeading': {
    de: 'Spendenstand auf betterplace.org',
    en: 'Donation progress on betterplace.org',
    fr: 'État des dons sur betterplace.org',
  },
  'content.donation.widgetLoad': { de: 'Spendenstand anzeigen', en: 'Show donation progress', fr: 'Afficher l’état des dons' },
  'content.donation.open': { de: 'Auf betterplace.org öffnen', en: 'Open on betterplace.org', fr: 'Ouvrir sur betterplace.org' },
  'content.donation.iframeTitle': {
    de: 'Spendenformular von WeWater auf betterplace.org',
    en: 'WeWater donation form on betterplace.org',
    fr: 'Formulaire de don de WeWater sur betterplace.org',
  },

  // Facebook link card (replaces the Facebook post plugin)
  'content.facebook.title': { de: 'Beitrag auf Facebook', en: 'Post on Facebook', fr: 'Publication sur Facebook' },
  'content.facebook.cta': { de: 'Auf Facebook ansehen', en: 'View on Facebook', fr: 'Voir sur Facebook' },

  // Video
  'content.video.play': { de: 'Video abspielen', en: 'Play video', fr: 'Lire la vidéo' },
  'content.video.download': { de: 'Video herunterladen', en: 'Download video', fr: 'Télécharger la vidéo' },

  // Blog post / project pages
  'content.by': { de: 'Von', en: 'By', fr: 'Par' },
  'content.minRead': { de: 'Min. Lesezeit', en: 'min read', fr: 'min de lecture' },
  'content.aboutAuthor': { de: 'Über den Autor', en: 'About the author', fr: 'À propos de l’auteur' },
  'content.comments': { de: 'Kommentare', en: 'Comments', fr: 'Commentaires' },
  'content.commentsClosed': {
    de: 'Die Kommentarfunktion ist geschlossen.',
    en: 'Comments are closed.',
    fr: 'Les commentaires sont fermés.',
  },
  'content.says': { de: 'sagt:', en: 'says:', fr: 'dit :' },
  'content.relatedPosts': { de: 'Projektupdates im Blog', en: 'Project updates on the blog', fr: 'Actualités du projet sur le blog' },
  'content.morePosts': { de: 'Neuigkeiten von WeWater', en: 'News from WeWater', fr: 'Actualités de WeWater' },
  'content.readMore': { de: 'Weiterlesen', en: 'Read more', fr: 'Lire la suite' },
  'content.status.in-progress': { de: 'In Arbeit', en: 'In progress', fr: 'En réalisation' },
  'content.status.completed': { de: 'Abgeschlossen', en: 'Completed', fr: 'Achevé' },
});
