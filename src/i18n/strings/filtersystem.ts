import { defineStrings } from '../define';

/**
 * /filtersystem/ overview, plus the spec table labels, spec values and photo descriptions
 * shared with the product pages (aqqabag.ts, aqqacube.ts, aqqasystem.ts).
 * Values are the ones the live site showed (the old page_aqqabag/-cube/-system.json took
 * precedence over page_filtersystem.json there).
 */
export default defineStrings({
  // /filtersystem/: page meta, hero and the three product rows
  'filtersystem.seo.title': { de: 'Wasserfilter', en: 'Water filters', fr: 'Filtres à eau' },
  'filtersystem.seo.description': {
    de: 'Die Wasserfilter der NGO WeWater werden in der Entwicklungszusammenarbeit eingesetzt. Hier findest du alle Informationen zu unseren Trinkwasserfiltern.  💧🚰💦💙',
    en: 'The water filters of the NGO WeWater are used in development cooperation. Here you can find all information about our drinking water filters. 💧🚰💦💙',
    fr: "Les filtres à eau de l'ONG WeWater sont employés dans le cadre de la coopération au développement. Vous trouverez ici toutes les informations sur nos filtres à eau potable. 💧🚰💦💙",
  },
  'filtersystem.hero.title': { de: 'Unsere Filtersysteme', en: 'Our filter systems', fr: 'Nos systèmes de filtration' },
  'filtersystem.learnMore': { de: 'Mehr erfahren', en: 'Learn more', fr: 'En savoir plus' },
  'filtersystem.bag.title': {
    de: 'Die Lösung für den Soforteinsatz und für Einzelpersonen',
    en: 'The solution for immediate use and for individuals',
    fr: 'La solution pour une utilisation immédiate et pour les particuliers',
  },
  'filtersystem.bag.text': {
    de: 'Um kurzfristig den Bedarf an sicherem Wasser zu decken, kann der AQQAbag ein bis zwei Personen mit mindestens 4 Litern Wasser pro Tag versorgen.',
    en: 'To meet short-term needs for safe water, the AQQAbag can provide one to two people with at least 4 liters of water per day.',
    fr: "Pour répondre à court terme aux besoins en eau potable, le sac AQQAbag peut fournir à une ou deux personnes un minimum de 4 litres d'eau par jour.",
  },
  'filtersystem.cube.title': {
    de: 'Für den Soforteinsatz in Communitys',
    en: 'For immediate use in communities',
    fr: 'Pour une utilisation immédiate dans les communautés',
  },
  'filtersystem.cube.text': {
    de: 'Der AQQAcube vereint die Vorteile von AQQAbag und AQQAsystem. Mit einem Gewicht von 30kg ist er sehr mobil und filtert mehr als 1000 Liter Wasser in 12 Stunden.',
    en: 'The AQQAcube combines the advantages of AQQAbag and AQQAsystem. With a weight of 30kg it is very mobile and filters more than 1000 liters of water in 12 hours.',
    fr: "L'AQQAcube combine les avantages du AQQAbag et du AQQAsystem. Avec un poids de 30kg, il est très mobile et filtre plus de 1000 litres d'eau en 12 heures.",
  },
  'filtersystem.system.title': {
    de: 'Die Lösung für den langfristigen Einsatz',
    en: 'The solution for long-term use',
    fr: 'La solution pour une utilisation à long terme',
  },
  'filtersystem.system.text': {
    de: 'Das AQQAsystem basiert auf der Idee des AQQAbag, ist jedoch modular skalierbar. So kann es jedem Einsatzort perfekt angepasst werden. Geeignet für Projekte mit sehr hohem Wasserbedarf.',
    en: 'The AQQAsystem is based on the idea of the AQQAbag, but is modularly scalable. This means it can be perfectly adapted to any site. Suitable for projects with very high water requirements.',
    fr: "L'AQQAsystem est basé sur l'idée de l'AQQAbag. Il est modularisé et scalable. Ainsi, il peut être adapté à tout type d'emplacement. Convient aux projets à besoins en eau élevés.",
  },
  'filtersystem.compare.caption': {
    de: 'Unsere Filtersysteme im Vergleich',
    en: 'Our filter systems compared',
    fr: 'Nos systèmes de filtration en comparaison',
  },

  // Spec table labels (overview comparison and product pages)
  'filtersystem.spec.overview': { de: 'Übersicht', en: 'Overview', fr: "Vue d'ensemble" },
  'filtersystem.spec.use': { de: 'Beschreibung', en: 'Description', fr: 'Description' },
  'filtersystem.spec.users': { de: 'Anwender', en: 'User', fr: 'Utilisateur' },
  'filtersystem.spec.quantity': { de: 'Filtermenge', en: 'Filter quantity', fr: 'Quantité de filtration' },
  'filtersystem.spec.innovation': { de: 'Innovation', en: 'Innovation', fr: 'Innovation' },
  'filtersystem.spec.cost': { de: 'Kosten', en: 'Costs', fr: 'Prix' },
  'filtersystem.spec.weight': { de: 'Leergewicht', en: 'Empty weight', fr: 'Poids à vide' },
  'filtersystem.spec.retention': {
    de: 'Rückhalterate Bakterien',
    en: 'Bacteria retention rate',
    fr: 'Taux de rétention bactéries',
  },
  'filtersystem.spec.durability': { de: 'Haltbarkeit', en: 'Durability', fr: 'Durabilité' },
  'filtersystem.spec.manual': { de: 'Bedienungsanleitung', en: 'Instruction manual', fr: "Mode d'emploi" },

  // Spec values shared by all systems
  'filtersystem.spec.membrane': {
    de: 'Membranfilter mit hoher Rückhalterate',
    en: 'Membrane filter with high retention rate',
    fr: 'Filtre à membrane avec un taux de rétention élevé',
  },
  'filtersystem.spec.retentionValue': { de: '99,9999 Prozent', en: '99.9999%', fr: '99,9999 %' },
  'filtersystem.spec.certified': {
    de: 'zertifiziert von BCS, Florida, USA',
    en: 'certified by BCS, Florida, USA',
    fr: 'certifié par BCS, Floride, États-Unis',
  },
  'filtersystem.spec.manualGerman': { de: 'Deutsch', en: 'German', fr: 'Allemand' },
  'filtersystem.spec.manualEnglish': { de: 'Englisch', en: 'English', fr: 'Anglais' },

  // AQQAbag
  'filtersystem.bag.use': {
    de: 'Sofortlösung (z.B. nach einer Umweltkatastrophe)',
    en: 'Instant solution (after an environmental disaster, for example)',
    fr: 'Solution immédiate (par exemple, après une catastrophe environnementale)',
  },
  'filtersystem.bag.users': {
    de: 'Einzelpersonen, Reisende',
    en: 'Individuals, travelers',
    fr: 'Particuliers, voyageurs',
  },
  'filtersystem.bag.quantity': {
    de: '4 Liter sauberes Wasser mindestens bei 8 Std. Betriebszeit am Tag',
    en: '4 litres of clean water at least for 8 hours of operation per day',
    fr: "4 litres d'eau propre au minimum pour 8 heures de fonctionnement par jour",
  },
  'filtersystem.bag.cost': { de: '59 Euro je Stück', en: '59€ with VAT', fr: '59 euros par pièce (prix brut)' },
  'filtersystem.bag.durability': {
    de: '6 Monate im Dauerbetrieb (gelegentlich muss der AQQAbag mit klarem Wasser ausgespült werden)',
    en: '6 months in continuous operation (the AQQAbag must be rinsed with clear water occasionally)',
    fr: "6 mois en fonctionnement continu (de temps en temps, l'AQQAbag doit être rincé à l'eau claire)",
  },

  // AQQAcube
  'filtersystem.cube.use': { de: 'Sofortlösung', en: 'Instant solution', fr: 'Solution immédiate' },
  'filtersystem.cube.users': {
    de: 'Gemeinschaften, Dörfer, Flüchtlingsunterkünfte',
    en: 'Communities, villages, refugee shelters',
    fr: 'Communautés, villages, abris pour réfugiés',
  },
  'filtersystem.cube.usersExamples': {
    de: 'z.B. Dorfgemeinschaften, Flüchtlingsunterkünfte, Schulen',
    en: 'e.g. village communities, refugee shelters, schools',
    fr: 'par exemple, communautés rurales, abris pour réfugiés, écoles',
  },
  'filtersystem.cube.quantity': {
    de: '1000 Liter sauberes Wasser mindestens pro Tag bei 12 Std. Betriebszeit',
    en: 'At least 400 liters of drinking water per day for 8 hours of operation time',
    fr: "Au moins 400 litres d'eau potable par jour pour 8h de service",
  },
  'filtersystem.cube.cost': { de: 'auf Anfrage', en: 'on request', fr: 'sur demande' },
  'filtersystem.cube.weight': { de: '30 kg', en: '30 kg', fr: '30 kg' },
  'filtersystem.cube.durability': {
    de: '10 Jahre (gelegentlich sollte er mit klarem Wasser ausgespült werden, alle 6 Monate muss er gereinigt werden)',
    en: '10 years (occasionally it should be rinsed with clear water, every 6 months it must be cleaned)',
    fr: "10 ans (de temps en temps il faut rincer le cube à l'eau claire, tous les 6 mois il faut le nettoyer)",
  },

  // AQQAsystem
  'filtersystem.system.use': { de: 'Langfristige Lösung', en: 'Long term solution', fr: 'Solution à long terme' },
  'filtersystem.system.users': {
    de: 'Große Communitys mit hohem Wasserbedarf',
    en: 'Large communities with high water demand',
    fr: 'Grandes communautés avec des besoins en eau élevés',
  },
  'filtersystem.system.quantity': {
    de: '1000 bis 30.000 Liter sauberes Wasser pro Tag',
    en: '1000 to 30,000 litres of clean water per day',
    fr: "1000 à 30.000 litres d'eau propre par jour",
  },
  'filtersystem.system.sizeDependent': {
    de: 'Abhängig von der Größe des Filtersystems',
    en: 'Depending on the size of the filter system',
    fr: 'En fonction de la taille du système de filtration',
  },
  'filtersystem.system.durability': {
    de: '5 Jahre (halbjährlich muss das AQQAsystem mit klarem Wasser gespült werden)',
    en: 'Indefinitely, single filter plates can easily be replaced if necessary',
    fr: 'Indéfiniment, les plaques filtrantes peuvent être remplacées facilement individuellement si nécessaire',
  },

  // Photo descriptions (alt text), shared by the overview and the product pages
  'filtersystem.img.bagBags': {
    de: 'Mehrere AQQAbag-Wasserfilterbeutel mit WeWater-Logo auf dem Boden',
    en: 'Several AQQAbag water filter bags with the WeWater logo on the ground',
    fr: 'Plusieurs sacs filtrants AQQAbag avec le logo WeWater posés au sol',
  },
  'filtersystem.img.bagUse': {
    de: 'Ein AQQAbag mit trübem Flusswasser hängt neben einer Flasche mit gefiltertem Wasser',
    en: 'An AQQAbag filled with murky river water hangs next to a bottle of filtered water',
    fr: "Un AQQAbag rempli d'eau de rivière trouble suspendu à côté d'une bouteille d'eau filtrée",
  },
  'filtersystem.img.bagDetail': {
    de: 'Eine Frau hält einen AQQAbag mit Flusswasser und eine Flasche mit gefiltertem Wasser',
    en: 'A woman holds an AQQAbag with river water and a bottle of filtered water',
    fr: "Une femme tient un AQQAbag rempli d'eau de rivière et une bouteille d'eau filtrée",
  },
  'filtersystem.img.cubeChildren': {
    de: 'Kinder füllen sauberes Wasser aus einem blauen AQQAcube in Becher',
    en: 'Children fill cups with clean water from a blue AQQAcube',
    fr: "Des enfants remplissent des gobelets d'eau propre à partir d'un AQQAcube bleu",
  },
  'filtersystem.img.cubeFilling': {
    de: 'Zwei Männer gießen Wasser aus einem Kanister in einen AQQAcube',
    en: 'Two men pour water from a canister into an AQQAcube',
    fr: "Deux hommes versent l'eau d'un bidon dans un AQQAcube",
  },
  'filtersystem.img.cubePallets': {
    de: 'Ein AQQAcube auf Holzpaletten in einer Lagerhalle',
    en: 'An AQQAcube on wooden pallets in a warehouse',
    fr: 'Un AQQAcube sur des palettes en bois dans un entrepôt',
  },
  'filtersystem.img.systemPlant': {
    de: 'Filterbecken des AQQAsystem mit eingesetzten Filterplatten',
    en: 'AQQAsystem filter tank with the filter plates installed',
    fr: "Bassin de filtration de l'AQQAsystem équipé de plaques filtrantes",
  },
  'filtersystem.img.systemModule': {
    de: 'Ein geschlossenes Filtermodul des AQQAsystem im Freien',
    en: 'A closed AQQAsystem filter module outdoors',
    fr: "Un module filtrant fermé de l'AQQAsystem, en extérieur",
  },
  'filtersystem.img.systemSite': {
    de: 'Ein Junge trinkt sauberes Wasser aus einem Wasserhahn',
    en: 'A boy drinks clean water from a tap',
    fr: "Un garçon boit de l'eau propre au robinet",
  },
});
