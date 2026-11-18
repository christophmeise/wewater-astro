import { defineStrings } from '../define';

/**
 * Donation pages: /spenden/, /spenden/einmalig/, /spenden/monatlich/.
 * Ported word for word from the old page_spenden.json and the spenden.* keys of translation.json.
 * Rich strings (<strong>, <docLink>…) are rendered with rich() from src/i18n/rich.ts.
 */
export default defineStrings({
  // /spenden/: page meta and hero
  'spenden.seo.title': { de: 'Spenden', en: 'Donate', fr: 'Donation' },
  'spenden.seo.description': {
    de: 'Mit deiner Spende bringst du sauberes Trinkwasser dorthin, wo es fehlt. Spende jetzt an WeWater.',
    en: 'With your donation, you bring clean drinking water to where it is missing. Donate to WeWater now.',
    fr: "Grâce à votre don, vous apportez de l'eau potable là où elle manque. Faites un don à WeWater dès maintenant.",
  },
  'spenden.hero.title': {
    de: 'Wasser weltweit klarmachen. Mit deiner Spende.',
    en: 'Clear water for the world. With your donation.',
    fr: 'Une eau claire pour le monde. Grâce à votre don.',
  },

  // The three ways to give (cards below the hero)
  'spenden.options.title': { de: 'So kannst du spenden', en: 'This is how you can donate', fr: 'Comment faire un don' },
  'spenden.options.monthly.title': {
    de: 'Du spendest monatlich einen Geldbetrag deiner Wahl',
    en: 'You donate a monthly amount of money of your choice',
    fr: "Vous faites un don mensuel d'un montant de votre choix",
  },
  'spenden.options.monthly.cta': { de: 'Monatlich Spenden', en: 'Donate monthly', fr: 'Faire un don mensuel' },
  'spenden.options.gift.title': {
    de: 'Du verschenkst eine individuelle Wasserspende',
    en: 'You give a personalised water donation as a gift',
    fr: 'Vous offrez un don d’eau personnalisé',
  },
  'spenden.options.gift.cta': { de: 'Spende verschenken', en: 'Give a donation', fr: 'Offrir un don' },
  'spenden.options.once.title': {
    de: 'Du spendest einmalig einen Geldbetrag deiner Wahl',
    en: 'You donate a one-time amount of money of your choice',
    fr: "Vous faites un don ponctuel d'un montant de votre choix",
  },
  'spenden.options.once.cta': { de: 'Einmalig Spenden', en: 'Single-time donation', fr: 'Don ponctuel' },
  'spenden.options.payment': {
    de: 'Zahlungsarten: PayPal, Kreditkarte, Banküberweisung',
    en: 'Payment methods: PayPal, credit card, bank transfer',
    fr: 'Moyens de paiement : PayPal, carte bancaire, virement bancaire',
  },

  // Donation widget: why donate, impact, use of funds, tax
  'spenden.eyebrow': {
    de: 'Werde Dauerspender*in',
    en: 'Become a permanent donor',
    fr: 'Devenez un donateur régulier',
  },
  'spenden.headline': {
    de: 'Deine Spende macht Wasser trinkbar',
    en: 'Your donation makes water safe to drink',
    fr: "Votre don rend l'eau potable",
  },
  'spenden.intro': {
    de: 'Hinter WeWater steht ein engagiertes, überwiegend ehrenamtliches Team. Um unsere Projekte weltweit umzusetzen und verlässlich zu begleiten, sind wir auf Spenden angewiesen. Unterstütze uns jetzt mit einer Spende!',
    en: 'WeWater is run by a dedicated team that works largely on a voluntary basis. To carry out our projects around the world and support them reliably, we depend on donations. Support us with a donation today!',
    fr: 'WeWater repose sur une équipe engagée, composée en grande partie de bénévoles. Pour mener nos projets à travers le monde et les accompagner de manière fiable, nous dépendons des dons. Soutenez-nous dès maintenant par un don !',
  },
  'spenden.trust1': {
    de: 'Unsere Gemeinnützigkeit ist vom Finanzamt anerkannt.',
    en: 'We are officially recognised as a non-profit organisation by the German tax authorities.',
    fr: "Notre statut d'organisation d'intérêt général est reconnu par l'administration fiscale allemande.",
  },
  'spenden.trust2': {
    de: 'Der Großteil unseres Teams engagiert sich ehrenamtlich. Damit unsere Projekte vor Ort gut begleitet werden, haben wir einen festen Projektmanager in Teilzeit an Bord.',
    en: 'Most of our team volunteers their time. To make sure our projects on the ground are well supported, we have a dedicated part-time project manager on board.',
    fr: 'La majeure partie de notre équipe est bénévole. Pour que nos projets sur le terrain soient bien accompagnés, nous avons un chef de projet salarié à temps partiel.',
  },
  'spenden.trust3': {
    de: 'Als kleine Organisation mit flachen Hierarchien arbeiten wir schlank und effizient. Wir halten unsere Kosten bewusst niedrig.',
    en: 'As a small organisation with flat hierarchies, we work lean and efficiently. We deliberately keep our costs low.',
    fr: 'En tant que petite organisation à la hiérarchie horizontale, nous travaillons de manière légère et efficace. Nous veillons à maintenir nos coûts au plus bas.',
  },
  'spenden.trust4': {
    de: 'Wir arbeiten transparent: Unsere Satzung ist veröffentlicht, und in unserem Blog und auf Social Media kannst du genau mitverfolgen, was mit deiner Spende passiert.',
    en: 'We work transparently: our articles of association are published, and on our blog and social media you can follow exactly what happens with your donation.',
    fr: 'Nous travaillons en toute transparence : nos statuts sont publiés, et sur notre blog et nos réseaux sociaux, vous pouvez suivre précisément ce que devient votre don.',
  },
  'spenden.impact.headline': {
    de: 'Was deine Spende konkret bewirken kann',
    en: 'What your donation can achieve',
    fr: 'Ce que votre don peut concrètement accomplir',
  },
  'spenden.impact1': {
    de: '<strong>5 € im Monat</strong> ermöglichen jedes Jahr rund 20 Kindern dauerhaft Zugang zu sauberem Trinkwasser, zum Beispiel an ihrer Schule.',
    en: '<strong>€5 a month</strong> gives around 20 children lasting access to clean drinking water every year, for example at their school.',
    fr: "<strong>5 € par mois</strong> permettent chaque année à environ 20 enfants d'avoir un accès durable à l'eau potable, par exemple dans leur école.",
  },
  'spenden.impact2': {
    de: '<strong>20 € im Monat</strong> sichern Wartung und Ersatzteile für einen bestehenden Filter. So bleibt das Wasser in einem Dorf dauerhaft sauber.',
    en: '<strong>€20 a month</strong> covers maintenance and spare parts for an existing filter, so that a village keeps its water clean for the long term.',
    fr: "<strong>20 € par mois</strong> couvrent l'entretien et les pièces de rechange d'un filtre existant. Ainsi, un village dispose durablement d'une eau propre.",
  },
  'spenden.impact3': {
    de: '<strong>100 €</strong> finanzieren die Laboranalyse einer Wasserprobe. Sie zeigt, ob und welche Lösung ein neues Projekt braucht.',
    en: '<strong>€100</strong> pays for the laboratory analysis of a water sample. It shows whether a new project needs a solution, and which one.',
    fr: "<strong>100 €</strong> financent l'analyse en laboratoire d'un échantillon d'eau. Elle montre si un nouveau projet a besoin d'une solution, et laquelle.",
  },
  'spenden.impact4': {
    de: '<strong>1.500 €</strong> finanzieren einen neuen AQQAcube, der rund 500 Menschen mit sauberem Trinkwasser versorgt.',
    en: '<strong>€1,500</strong> funds a new AQQAcube that provides around 500 people with clean drinking water.',
    fr: "<strong>1 500 €</strong> financent un nouvel AQQAcube qui fournit de l'eau potable à environ 500 personnes.",
  },
  'spenden.usage.headline': { de: 'Mittelverwendung', en: 'How we use donations', fr: 'Utilisation des dons' },
  'spenden.usage1': {
    de: 'Uns ist wichtig, transparent zu zeigen, wofür wir Spenden einsetzen. Sie fließen vor allem in unsere Projekte: Wasserfilter, Wasserinfrastruktur und Workshops vor Ort. Daneben fallen geringe Verwaltungskosten an, etwa für Website-Hosting, Kontoführung, Fundraising sowie Rechts- und Steuerberatung.',
    en: 'We want to show transparently what we use donations for. They mainly go into our projects: water filters, water infrastructure and workshops on the ground. In addition, there are small administrative costs, for example for website hosting, bank fees, fundraising, and legal and tax advice.',
    fr: "Il nous tient à cœur de montrer en toute transparence à quoi servent les dons. Ils sont principalement consacrés à nos projets : filtres à eau, infrastructures d'approvisionnement en eau et ateliers sur le terrain. S'y ajoutent de faibles frais administratifs, par exemple pour l'hébergement du site web, la tenue de compte, la collecte de fonds ainsi que le conseil juridique et fiscal.",
  },
  'spenden.usage2': {
    de: 'Mit der wachsenden Zahl an Projekten lassen sich Abstimmung mit unseren Partnerorganisationen, Planung und Berichterstattung nicht mehr allein im Ehrenamt leisten. Deshalb gehört seit November 2026 ein Projektmanager in Teilzeit fest zu unserem Team. Er hält den Kontakt zu unseren Partnern vor Ort und sorgt dafür, dass Projekte sorgfältig vorbereitet, eng begleitet und nachvollziehbar dokumentiert werden. So kann jede Spende ihre volle Wirkung entfalten. Alle anderen im Team engagieren sich weiterhin ehrenamtlich.',
    en: 'As the number of our projects grows, coordinating with our partner organisations, planning and reporting can no longer be handled by volunteers alone. That is why a part-time project manager has recently joined our team. He stays in close contact with our partners on the ground and makes sure that projects are carefully prepared, closely supported and documented in a traceable way. Everyone else on the team continues to volunteer.',
    fr: "Avec le nombre croissant de nos projets, la coordination avec nos organisations partenaires, la planification et les rapports ne peuvent plus reposer uniquement sur le bénévolat. C'est pourquoi nous avons créé un poste à temps partiel pour la coordination des projets. Il garantit que les projets sont soigneusement préparés, étroitement suivis et documentés de manière traçable, afin que chaque don produise pleinement son effet. Tous les autres membres de l'équipe restent bénévoles.",
  },
  'spenden.tax.headline': {
    de: 'Spenden an WeWater kannst du steuerlich geltend machen',
    en: 'Tax-deductible donations in Germany',
    fr: 'Déductibilité fiscale en Allemagne',
  },
  'spenden.tax1': {
    de: 'Die WeWater gemeinnützige UG ist laut Anlage zum Körperschaftsteuerbescheid 2024 des <strong>Finanzamts für Körperschaften I</strong> (Bredtschneiderstraße 5, 14057 Berlin) vom 03.07.2026 nach § 5 Abs. 1 Nr. 9 KStG <strong>von der Körperschaftsteuer befreit</strong> und dient ausschließlich und unmittelbar steuerbegünstigten gemeinnützigen Zwecken.',
    en: 'WeWater gemeinnützige UG is exempt from corporate income tax as a non-profit organisation under Section 5(1) No. 9 of the German Corporate Income Tax Act (KStG), according to the annex to the 2024 corporate income tax notice issued by the <strong>Finanzamt für Körperschaften I</strong> (Bredtschneiderstraße 5, 14057 Berlin) on 3 July 2026. It serves exclusively and directly tax-privileged charitable purposes.',
    fr: "La WeWater gemeinnützige UG est exonérée de l'impôt sur les sociétés en tant qu'organisation d'intérêt général, conformément au § 5, al. 1, n° 9 de la loi allemande relative à l'impôt sur les sociétés (KStG), selon l'annexe à l'avis d'imposition 2024 émis le 3 juillet 2026 par le <strong>Finanzamt für Körperschaften I</strong> (Bredtschneiderstraße 5, 14057 Berlin). Elle poursuit exclusivement et directement des buts d'intérêt général bénéficiant d'avantages fiscaux.",
  },
  'spenden.tax2': {
    de: 'Wir bestätigen, dass die Zuwendung nur zur Förderung der Entwicklungszusammenarbeit gemäß § 52 Abs. 2 Satz 1 Nr. 15 AO verwendet wird.',
    en: 'We confirm that donations are used solely to promote development cooperation in accordance with Section 52(2) sentence 1 No. 15 of the German Fiscal Code (AO).',
    fr: 'Nous confirmons que les dons sont utilisés uniquement pour promouvoir la coopération au développement, conformément au § 52, al. 2, phrase 1, n° 15 du Code fiscal allemand (AO).',
  },

  // Only shown on /en/ and /fr/ (German donors don't need it); the German text is unused.
  'spenden.taxForeign': {
    de: '<strong>Die folgenden Hinweise gelten für Steuerpflichtige in Deutschland.</strong>',
    en: '<strong>The following information applies to taxpayers in Germany.</strong> If you pay taxes in another country, please check with your local tax authority whether your donation can be deducted there.',
    fr: "<strong>Les informations suivantes s'appliquent aux contribuables en Allemagne.</strong> Si vous êtes imposable dans un autre pays, veuillez vérifier auprès de votre administration fiscale si votre don peut y être déduit.",
  },
  'spenden.taxSmall': {
    de: '<strong>Spenden bis 300 Euro</strong> kannst du <strong>ohne gesonderte Spendenbescheinigung</strong> steuerlich geltend machen (§ 50 Abs. 4 Satz 1 Nr. 2 Buchst. b EStDV). Das gilt für jede einzelne Spende, auch für monatliche Spenden. Als Nachweis genügen dein Kontoauszug und <docLink>dieses Dokument</docLink>. Bewahre beides gut auf. Das Finanzamt fordert die Belege nur bei Bedarf an. Wichtig: Gib bei jeder Überweisung den Verwendungszweck an (z. B. monatliche Spende, einmalige Spende). So können wir deine Spende richtig zuordnen.',
    en: '<strong>Donations of up to €300</strong> can be deducted <strong>without a separate donation receipt</strong> (Section 50(4) sentence 1 No. 2(b) EStDV). This applies to each individual donation, including monthly donations. Your bank statement together with <docLink>this document</docLink> (in German) is sufficient proof. Please keep both. The tax office will only ask for them if needed. Important: please state the purpose of each bank transfer (e.g. monthly donation, one-off donation) so that we can allocate your donation correctly.',
    fr: "<strong>Les dons jusqu'à 300 €</strong> peuvent être déduits <strong>sans reçu fiscal distinct</strong> (§ 50, al. 4, phrase 1, n° 2, lettre b EStDV). Cela vaut pour chaque don, y compris les dons mensuels. Votre relevé bancaire accompagné de <docLink>ce document</docLink> (en allemand) suffit comme justificatif. Conservez les deux : l'administration fiscale ne les demande qu'en cas de besoin. Important : indiquez l'objet de chaque virement (par ex. don mensuel, don ponctuel) afin que nous puissions attribuer correctement votre don.",
  },
  'spenden.taxLarge': {
    de: '<strong>Für Spenden über 300 Euro</strong> stellen wir dir gern eine <strong>Spendenbescheinigung</strong> aus. Schreib uns dafür eine E-Mail an <mailLink>hi@wewater.org</mailLink> mit deinem <strong>vollständigen Namen und deiner Anschrift</strong>. Wir senden dir die Bescheinigung dann per Mail zu.',
    en: '<strong>For donations over €300</strong>, we are happy to issue a <strong>donation receipt</strong>. Just send an email to <mailLink>hi@wewater.org</mailLink> with your <strong>full name and address</strong>, and we will email you the receipt.',
    fr: '<strong>Pour les dons supérieurs à 300 €</strong>, nous vous établissons volontiers un <strong>reçu fiscal</strong>. Envoyez-nous simplement un e-mail à <mailLink>hi@wewater.org</mailLink> en indiquant <strong>vos nom et prénom ainsi que votre adresse</strong>. Nous vous enverrons le reçu par e-mail.',
  },
  'spenden.taxStatute': {
    de: 'Unsere Satzung findest du <statuteLink>hier</statuteLink>.',
    en: 'You can find our articles of association <statuteLink>here</statuteLink> (in German).',
    fr: 'Nos statuts sont disponibles <statuteLink>ici</statuteLink> (en allemand).',
  },
  'spenden.taxStatute.linkHint': { de: '(Satzung, PDF)', en: '(articles of association, PDF)', fr: '(statuts, PDF)' },
  'spenden.taxSmall.linkHint': { de: '(PDF)', en: '(PDF)', fr: '(PDF)' },

  // /spenden/einmalig/
  'spenden.once.seo.title': { de: 'Einmalig spenden', en: 'One-time donation', fr: 'Don ponctuel' },
  'spenden.once.seo.description': {
    de: 'Spende an WeWater und hilf Menschen in Not. Mit deiner Spende können wir sauberes Trinkwasser spenden. 💧🚰💦💙',
    en: 'Donate to WeWater and help people in need. With your donation we can donate clean drinking water. 💧🚰💦💙',
    fr: "Faites un don à WeWater et aidez les personnes en difficulté. Avec votre don, nous pouvons donner de l'eau potable. 💧🚰💦💙",
  },
  'spenden.once.intro': {
    de: 'Vielen Dank, dass du an WeWater spenden möchtest. Für eine einmalige Spende gibt es drei Möglichkeiten.',
    en: 'Thank you for donating to WeWater. There are three ways to make a one-time donation.',
    fr: 'Merci de vouloir faire un don à WeWater. Il y a trois façons de faire un don ponctuel.',
  },
  'spenden.once.paypal': {
    de: 'Du spendest via PayPal.',
    en: 'You donate via PayPal.',
    fr: 'Vous faites un don avec PayPal.',
  },
  'spenden.once.bank': {
    de: 'Du spendest über eine Banküberweisung an',
    en: 'You donate by bank transfer to',
    fr: 'Vous faites un don par virement bancaire à',
  },
  'spenden.once.betterplace': {
    de: 'Du spendest über unsere Projektseite auf Betterplace.',
    en: 'You donate via our project page on Betterplace.',
    fr: 'Vous faites un don via notre page de projet sur Betterplace.',
  },

  // /spenden/monatlich/
  'spenden.monthly.seo.title': { de: 'Monatlich spenden', en: 'Donate monthly', fr: 'Donation mensuelle' },
  'spenden.monthly.seo.description': {
    de: 'Geld spenden und etwas Gutes tun. Mit deiner Spende können wir sauberes Trinkwasser spenden. 💧🚰💦💙',
    en: 'Donate money and do a good deed. With your donation we can donate clean drinking water. 💧🚰💦💙',
    fr: "Faites un don pour une bonne cause. Avec votre don, nous pouvons donner de l'eau potable.💧🚰💦💙",
  },
  'spenden.monthly.intro': {
    de: 'Wenn du gerne regelmäßig an WeWater spenden möchtest, dann gibt es zwei Möglichkeiten.',
    en: 'If you would like to donate to WeWater regularly, there are two options.',
    fr: "Si vous souhaitez faire un don à WeWater régulièrement, deux options s'offrent à vous.",
  },
  'spenden.monthly.paypal': {
    de: 'Du spendest monatlich via PayPal.',
    en: 'You donate monthly via PayPal.',
    fr: 'Vous faites un don mensuel avec PayPal.',
  },
  'spenden.monthly.paypalText': {
    de: 'Klicke dafür einfach auf diesen Spenden-Button, gib den gewünschten Betrag ein und setze das Häkchen bei “monatliche Spende”. PayPal akzeptiert zahlreiche Zahlungsmöglichkeiten. Vielen Dank für deine Unterstützung!',
    en: 'Simply click on this donation button, enter the desired amount and check the box "monthly donation". PayPal accepts many payment methods. Thank you for your support!',
    fr: 'Cliquez simplement sur ce bouton de don, saisissez le montant souhaité et cochez la case "don mensuel". PayPal accepte de nombreux modes de paiement. Merci de votre soutien !',
  },
  'spenden.monthly.standingOrder': {
    de: 'Du richtest einen Dauerauftrag bei deiner Bank ein. Das machst du so:',
    en: 'You set up a standing order with your bank. This is how to do it:',
    fr: 'Vous établissez un virement permanent auprès de votre banque. Vous pouvez faire ainsi :',
  },
  'spenden.monthly.copyDetails': {
    de: 'Du kopierst dir die unten genannten Kontodaten oder schreibst sie ab.',
    en: 'Copy or write down the account information indicated below.',
    fr: 'Vous copiez-collez ou notez nos coordonnées bancaires ci-dessous.',
  },
  'spenden.monthly.standingOrderText': {
    de: 'Dann richtest du bei deiner Bank einen Dauerauftrag ein. Gib bitte Vor- und Nachnamen und den Verwendungszweck deiner Spende (z.B. monatliche Spende) an. Vielen Dank für deine Unterstützung!',
    en: 'Then set up a standing order with your bank. Enter your first and last name and the purpose of your donation (e.g. monthly donation). Thank you for your support!',
    fr: 'Ensuite, mettez en place un virement permanent avec votre banque. Veuillez indiquer votre nom et prénom ainsi que l\'objet de votre don (par exemple "don mensuel"). Merci de votre soutien !',
  },

  // Shared by the donation sub-pages
  'spenden.paypal.button': { de: 'Mit PayPal spenden', en: 'Donate with PayPal', fr: 'Faire un don avec PayPal' },
  /** Heading above the betterplace form (DonationFormSection). */
  'spenden.form.title': { de: 'Spende jetzt', en: 'Donate now', fr: 'Faites un don' },
});
