import { defineStrings } from '../define';

/**
 * Mailchimp newsletter sign-up (src/components/pages/NewsletterForm.astro).
 * Texts ported from the old sidebar strings in translation.json.
 */
export default defineStrings({
  'newsletter.title': {
    de: 'Jetzt für unseren Wassernewsletter anmelden',
    en: 'Sign up now for our water newsletter',
    fr: 'Inscrivez-vous à notre newsletter sur l’eau',
  },
  'newsletter.email': { de: 'E-Mail-Adresse', en: 'Email address', fr: 'Adresse e-mail' },
  'newsletter.submit': { de: 'Anmelden', en: 'Sign up', fr: 'S’inscrire' },
  /** Followed by a link to the privacy policy ('newsletter.privacyLink'). */
  'newsletter.privacy': {
    de: 'Die Anmeldung läuft über Mailchimp und öffnet sich in einem neuen Tab. Abmelden kannst du dich jederzeit. Mehr dazu in der',
    en: 'You sign up via Mailchimp, which opens in a new tab. You can unsubscribe at any time. More in our',
    fr: 'L’inscription se fait via Mailchimp, dans un nouvel onglet. Vous pouvez vous désabonner à tout moment. Plus d’informations dans notre',
  },
  'newsletter.privacyLink': { de: 'Datenschutzerklärung', en: 'privacy policy', fr: 'politique de confidentialité' },
  /** Accessible name of the hidden anti-spam field (never shown). */
  'newsletter.honeypot': { de: 'Nicht ausfüllen', en: 'Leave this field empty', fr: 'Laissez ce champ vide' },
});
