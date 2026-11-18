import { defineStrings } from '../define';

/**
 * /filtersysteme/tutorials/: AQQAcube tutorial videos (YouTube, loaded only on click).
 */
export default defineStrings({
  // /filtersysteme/tutorials/
  'tutorials.seo.title': { de: 'Tutorials', en: 'Tutorials', fr: 'Tutoriels' },
  'tutorials.seo.description': {
    de: 'In diesen Videos erklären wir unsere Wasserfilter. Schau dir die Videos an und lerne, wie man unsere Trinkwasserfilter installiert, wartet und pflegt. 💧🚰💦💙',
    en: 'In these videos we explain how our water filters work. Watch the videos and learn how to install, maintain and care for our drinking water filters. 💧🚰💦💙',
    fr: 'Dans ces vidéos, nous expliquons le fonctionnement de nos filtres à eau. Apprenez comment installer, maintenir et entretenir nos filtres à eau potable. 💧🚰💦💙',
  },
  'tutorials.title': { de: 'Tutorials', en: 'Tutorials', fr: 'Tutoriels' },
  'tutorials.lead': {
    de: 'Installation, Inbetriebnahme, Wartung und Desinfektion',
    en: 'Installation, operation, maintenance and disinfection',
    fr: 'Installation, mise en service, maintenance et désinfection',
  },
  'tutorials.intro': {
    de: 'Um die Installation, Inbetriebnahme, Wartung und Desinfektion des AQQAcube zu erklären, haben wir fünf Videos produziert.',
    en: 'We produced five videos to explain the installation, operation, maintenance and disinfection of the AQQAcube.',
    fr: "Pour expliquer l'installation, la mise en service, la maintenance et la désinfection de l'AQQAcube, nous avons produit cinq vidéos.",
  },
  'tutorials.play': { de: 'Video abspielen', en: 'Play video', fr: 'Lire la vidéo' },

  // Video titles and YouTube IDs per language. French has no own videos: it uses the German ones (as the old site did through its fallback).
  'tutorials.video.intro.title': {
    de: 'Vorstellung AQQAcube',
    en: 'Presentation AQQAcube',
    fr: "Présentation de l'AQQAcube",
  },
  'tutorials.video.intro.id': { de: 'YhAQGvI53-0', en: 'nwO_-ws6jI4', fr: 'YhAQGvI53-0' },
  'tutorials.video.installation.title': {
    de: 'Installation AQQAcube',
    en: 'Installation AQQAcube',
    fr: "Installation de l'AQQAcube",
  },
  'tutorials.video.installation.id': { de: '63zYRLNKUQQ', en: 'vPSpFbZK7UU', fr: '63zYRLNKUQQ' },
  'tutorials.video.operation.title': {
    de: 'Inbetriebnahme AQQAcube',
    en: 'Operation AQQAcube',
    fr: "Mise en service de l'AQQAcube",
  },
  'tutorials.video.operation.id': { de: 'Bk2HdfRUCIo', en: 'ulR2C0G4Itk', fr: 'Bk2HdfRUCIo' },
  'tutorials.video.maintenance.title': {
    de: 'Wartung AQQAcube',
    en: 'Maintenance AQQAcube',
    fr: "Maintenance de l'AQQAcube",
  },
  'tutorials.video.maintenance.id': { de: '20he8UjmFZs', en: 'Vn_Cqajxy9c', fr: '20he8UjmFZs' },
  'tutorials.video.disinfection.title': {
    de: 'Desinfektion AQQAcube',
    en: 'Disinfection AQQAcube',
    fr: "Désinfection de l'AQQAcube",
  },
  'tutorials.video.disinfection.id': { de: 'QgTG1h1hZMA', en: 'Q7i4l1sQ3bg', fr: 'QgTG1h1hZMA' },
});
