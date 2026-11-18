import { defineStrings } from '../define';

/**
 * /unterstuetzen/: ways to support WeWater without donating money.
 * Rich strings (<mailLink>…) are rendered with rich() from src/i18n/rich.ts.
 */
export default defineStrings({
  // /unterstuetzen/. The old page had 7 points; Amazon Smile (point 7) ended in 2023, so it is a 6-point plan now.
  'unterstuetzen.seo.title': { de: 'WeWater unterstützen', en: 'Support WeWater', fr: 'Supporter WeWater' },
  'unterstuetzen.seo.description': {
    de: 'Kindern helfen ohne Geld zu spenden? Das geht. Hier siehst du, wie du uns auch ohne eine Geldspende unterstützen kannst. 💧🚰💦💙',
    en: "Help children without donating money? It's possible. Here you can see how you can support us without donating money. 💧🚰💦💙",
    fr: "Aider les enfants sans donner d'argent ? C'est possible. Vous pouvez voir ici comment nous soutenir sans donner de l'argent. 💧🚰💦💙",
  },
  'unterstuetzen.title': { de: 'Dein 6-Punkte-Plan', en: 'Your 6-point plan', fr: 'Votre plan en 6 points' },
  'unterstuetzen.lead': {
    de: 'So kannst du uns auch ohne eine finanzielle Spende unterstützen',
    en: 'How you can support us even without donating money',
    fr: 'Voici comment vous pouvez nous supporter sans faire un don',
  },
  'unterstuetzen.intro': {
    de: 'Manchmal ist man etwas knapp bei Kasse – wir kennen das. Doch es gibt diverse Möglichkeiten, wie du uns ohne eine finanzielle Spende unterstützen kannst. Schau mal in diese Liste. Sicher findest du etwas, womit du WeWater helfen kannst. Vielen, vielen Dank!',
    en: 'Sometimes one can be a bit short of cash - we know that. But there are various other ways you can support us, even without donating money. Have a look at this list. There is probably something you can do for us. Many, many thanks!',
    fr: "Parfois, on peut être un peu à court d'argent. Nous le savons bien nous-mêmes. Mais il existe plusieurs façons de nous supporter sans obligatoirement donner soutien financièrement. Jetez un coup d'œil sur cette liste. Peut-être que vous y trouverez quelque chose à faire pour aider la cause de WeWater. Merci beaucoup !",
  },
  'unterstuetzen.like.title': {
    de: 'Like unsere Facebook-Seite',
    en: 'Like our Facebook page',
    fr: 'Aimez notre page Facebook',
  },
  'unterstuetzen.share.title': {
    de: 'Teile unsere Facebook-Seite',
    en: 'Share our Facebook page',
    fr: 'Partagez notre page Facebook',
  },
  'unterstuetzen.share.text': {
    de: 'Nachdem du uns auf <facebookLink>unserer Facebook-Seite ein Like</facebookLink> gelassen hast, freuen wir uns sehr darüber, wenn du die Seite deinen Freunden empfiehlst, um uns bekannter zu machen.',
    en: 'After you left us a <facebookLink>Like on our Facebook page</facebookLink>, we would be very happy if you would recommend the page to your friends, to make us more known.',
    fr: 'Après nous avoir laissé un <facebookLink>Like sur notre page Facebook</facebookLink>, nous apprécierions que vous recommandiez la page à vos amis pour nous faire connaitre davantage.',
  },
  'unterstuetzen.follow.title': {
    de: 'Folge uns auf Instagram',
    en: 'Follow us on Instagram',
    fr: 'Suivez-nous sur Instagram',
  },
  'unterstuetzen.status.title': {
    de: 'Kopiere das in deinen WhatsApp-, Telegram- oder Signal-Status',
    en: 'Copy this in your WhatsApp, Telegram or Signal status',
    fr: 'Copiez ce texte dans votre statut WhatsApp, Telegram ou Signal',
  },
  'unterstuetzen.status.quote': {
    de: 'Ich unterstütze wewater.org. Spende auch du für sauberes Trinkwasser!',
    en: 'I support wewater.org. You too can donate for clean drinking water!',
    fr: "Je soutiens wewater.org. Vous aussi, vous pouvez faire un don pour de l'eau potable propre !",
  },
  'unterstuetzen.contacts.title': {
    de: 'Liefere uns wertvolle Kontakte',
    en: 'Provide us with valuable contacts',
    fr: 'Fournissez-nous des contacts utiles',
  },
  'unterstuetzen.contacts.text': {
    de: 'Jeder kennt jemanden, der einen kennt... der einen kennt. Wir sind dankbar über jeden Kontakt, der uns auf unserem Weg helfen kann. Das können zum Beispiel Menschen mit Know-how sein, Menschen mit guten Beziehungen in die Medien oder Menschen, die bereit sind für unser Engagement zu spenden. Schreib uns an <mailLink>hi@wewater.org</mailLink>. Oder empfiehle uns direkt weiter. Vielen Dank!',
    en: 'Everyone knows someone who knows someone... who knows someone. We are grateful for every contact who can help us on our way. This could be people with know-how, people with good connections to the media or people who are willing to donate to our cause. Write to us at <mailLink>hi@wewater.org</mailLink>. Or recommend us directly. Thank you!',
    fr: "Tout le monde connaît quelqu'un qui connaît quelqu'un... qui connaît quelqu'un. Nous sommes reconnaissants pour tout contact qui peut nous aider sur notre chemin. Il peut s'agir de personnes à compétences particulières, de personnes ayant de bonnes relations dans les médias ou de personnes prêtes à faire des dons pour notre cause. Écrivez-nous à <mailLink>hi@wewater.org</mailLink>. Ou recommandez-nous directement. Merci beaucoup !",
  },
  'unterstuetzen.involve.title': { de: 'Bring dich ein', en: 'Get involved', fr: 'Impliquez-vous' },
  'unterstuetzen.involve.text': {
    de: 'Bei unserer ehrenamtlichen Arbeit für WeWater brauchen wir Designer, Programmierer, Logistik-Experten... Menschen, die Lust und Spaß daran haben sich zu engagieren. Was kannst du gut? Wir können jede Hilfe und jedes Talent gebrauchen, also schreib uns an <mailLink>hi@wewater.org</mailLink>. Jede Unterstützung ist herzlich willkommen!',
    en: 'In our volunteer work for WeWater, we need designers, programmers, logistics experts... People who want to get involved and have fun doing it. What are you good at? We can use all the help and talent we can get, so drop us a line at <mailLink>hi@wewater.org</mailLink>. Any and all support is greatly appreciated!',
    fr: "Dans le cadre de notre travail bénévole pour WeWater, nous avons besoin de concepteurs, programmeurs, d'experts en logistique... Des personnes qui veulent s'impliquer et qui y prennent du plaisir. Dans quel domaine êtes-vous doué ? Nous avons besoin de toute l'aide possible et de tous les talents que nous pouvons obtenir. Ecrivez-nous à <mailLink>hi@wewater.org</mailLink>. Tout soutien est grandement apprécié !",
  },
});
