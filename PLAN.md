# WeWater rebuild plan

Status (2026-11-18): phases 0–5 done (analytics open) and the automated part of phase 6. All pages are rebuilt in de/en/fr, all content is migrated, and every page type scores Lighthouse 100/100/100/100 on mobile and desktop. Next: phase 7 (cutover), which needs the WeWater team: connect Netlify, review open content questions (see "Open items for WeWater"), then switch the domain.

## Goal

Rebuild [wewater.org](https://www.wewater.org) as a fully static site:

- **Same design and pages.** Near-identical to today in German, English and French.
- **Same URLs.** No SEO loss.
- **No CMS.** All content lives in this repo. Maintainers edit it in code with Claude.
- **Lighthouse 100/100/100/100** on every page type: performance, accessibility, best practices and SEO.
- **Shop excluded.** It stays at shop.wewater.org; we only link to it.

## Where we start from

The current site is Gatsby 5 + WordPress (via `gatsby-source-wordpress`), with Semantic UI + Less, deployed on Netlify. It renders 540 pages: 180 routes × 3 languages.

Lighthouse baseline on the live site (2026-11-18, Lighthouse 12):

| Page | Device | Perf | A11y | Best pr. | SEO | LCP | Weight |
|---|---|---|---|---|---|---|---|
| `/` | mobile | 96 | 82 | 96 | 92 | 1.7 s | 1.6 MB |
| `/` | desktop | 86 | 83 | 96 | 92 | 2.2 s | 2.3 MB |
| `/spenden/` | mobile | 74 | 88 | 75 | 83 | 5.1 s | 5.9 MB |
| `/spenden/` | desktop | 88 | 91 | 74 | 83 | 1.7 s | 6.5 MB |
| project page (Uvira) | mobile | 64 | 88 | 75 | 92 | 18.4 s | 9.1 MB |
| project page (Uvira) | desktop | 75 | 91 | 74 | 92 | 2.6 s | 9.5 MB |

What drags the scores down:

- **The betterplace iframe.** It loads Stripe (2.7 MB), hCaptcha (1 MB) and betterplace itself (1.3 MB). It also causes most of the best-practices failures: third-party cookies, console errors, inspector issues.
- **Full-size WordPress images** on project pages (2.9 MB from wewaterbackend.org on the Uvira page).
- **Accessibility:** colour contrast (see Decision 4), heading order, invalid ARIA from Semantic UI.
- **SEO:** link text, non-crawlable anchors, no canonical, no hreflang, no `og:image`.

## Recommended stack

| Concern | Choice | Why |
|---|---|---|
| Framework | **Astro 7.4** (`output: 'static'`) | Ships zero JS by default. Built-in i18n routing, image pipeline and font optimisation. The Rust compiler (v7) makes builds fast. Purpose-built for content sites like this. |
| Runtime | Node 24 LTS (Astro 7 needs Node ≥ 22.23) | Pin it in `.nvmrc` and Netlify. |
| Language | TypeScript (strict) + `astro check` | Typos in content or missing translations fail the build instead of reaching production. |
| Content | Astro content collections, **MDX** files with Zod schemas | One file per post, project or team member, with frontmatter validated at build. MDX lets content use components (`<Gallery>`, `<YouTube>`, `<DonationForm>`) instead of raw WordPress HTML. Easy for Claude to edit safely. |
| Styling | **Tailwind CSS 4.3 + HeroUI v3 styles (`@heroui/styles`, CSS-only)** with WeWater tokens | One coherent design system with semantic tokens, a fluid type scale and ready-made accessible component styles, consistent with the Scripe project. Compiles to about 9 KB of gzipped CSS and no JS. Semantic UI (5.6 MB of vendored Less) goes away. See Decision 6. |
| Images | `astro:assets` `<Picture>` → AVIF + WebP with responsive `srcset` | The hero/LCP image loads eagerly with `fetchpriority="high"`; everything else is lazy. |
| Fonts | Astro Fonts API, local Poppins woff2, latin subset | Only the weights actually used. The above-the-fold weight is preloaded. Generated fallback metrics give zero layout shift. |
| i18n | Astro built-in i18n: `defaultLocale: 'de'`, no prefix for German, `/en/` and `/fr/` | URLs stay exactly as today. UI strings move from i18next JSON to typed TS dictionaries, so a missing French key is a type error. |
| YouTube | `@astro-community/astro-embed-youtube` (lite facade) | A thumbnail plus play button. The YouTube player only loads on click, so we avoid about 1 MB of JS per video. |
| Hosting | **Netlify**, as today: static deploy, `_redirects`, `_headers` | Deploy previews per pull request. Long-lived immutable cache for `/_astro/*`. Security headers, including a CSP. |
| Quality gates | GitHub Actions: `astro check` → build → Lighthouse CI (`@lhci/cli` 0.16) asserting 100 → Playwright visual diff against the live site → link check | "100/100" and "near identical" become tests rather than hopes. |

**Alternatives considered:**

- **Eleventy 3.1:** also zero-JS and fast. Weaker image, i18n and type tooling, and less familiar to Claude than Astro.
- **Next.js 16 static export:** ships a React runtime on every page. Blogs consistently report a 10–15 point Lighthouse gap against Astro for static content.
- **Hugo:** fastest builds, but Go templates are harder to edit safely.

Astro is the right call for this site.

## Interactive bits without frameworks

Today the site ships React, Semantic UI, Swiper, react-image-gallery, Lottie and sal.js. In the rebuild each becomes HTML/CSS, or a few lines of inline script:

| Today | Rebuild |
|---|---|
| Mega-menu popover (Filtersysteme) | CSS `:hover` / `:focus-within` plus keyboard support |
| Mobile burger menu | `<button aria-expanded>` with a tiny inline script |
| Language switcher dropdown | Plain links to the paired translation of the current page |
| Swiper blog sliders | CSS scroll-snap carousel. Arrows via about 20 lines of script; autoplay dropped or kept. |
| Project galleries (react-image-gallery) | CSS scroll-snap strip plus a native `<dialog>` lightbox |
| FAQ accordion | `<details>` / `<summary>` |
| Project filter (Alle / In Arbeit / Abgeschlossen) | Radio buttons plus CSS `:has()`, no JS |
| Scroll reveal (sal.js) | CSS scroll-driven animations (`animation-timeline: view()`), disabled with `prefers-reduced-motion` |
| Lord-icon / Lottie animations | Static SVG, or the Lottie player lazy-loaded on idle. See Decision 7. |
| LiterCounter | Server-rendered number plus a tiny inline ticker script |
| Video heroes | `<video>` with a poster image as the LCP element, `preload="metadata"`, re-encoded files |
| Cookie banner | Depends on Decision 2. Ideally not needed at all. |

## Content migration (one-off, scripted)

`scripts/migrate-wp.ts` pulls everything from `https://www.wewaterbackend.org/graphql` and writes it into the repo. We can re-run it until cutover, then delete it.

**Posts.** 93 posts (46 de / 28 en / 19 fr) become `src/content/blog/<lang>/<slug>.mdx`.
- Frontmatter: title, date, author, categories, hero image, `translationKey`.
- HTML is converted to Markdown.
- Galleries, YouTube, Facebook and betterplace embeds become MDX components.

**Projects.** 67 projects (29 / 20 / 18) become `src/content/projects/<lang>/<slug>.mdx`. Gutenberg blocks are mapped as follows:

| Gutenberg block | Becomes |
|---|---|
| `core/table` | Markdown table |
| `core/gallery` | `<Gallery>` |
| `block-intro` group | `<IntroTiles>` |
| `core/columns` | `<Columns>` |
| Pasted betterplace iframe in `core/html` | `<DonationForm />` |

The project status (in progress / completed) and filter type (AQQAbag / AQQAcube) become frontmatter fields instead of category-name magic.

**Team.** 9 members become `src/content/team/<name>.md`, with per-language short and long descriptions in frontmatter.

**Categories.** These become a typed `categories.ts`, with the colour moved out of the WordPress description field and a label per language.

**Pages.**
- FAQ: per language, `src/content/faq/<lang>.md`. This also fixes the answers that currently lose their HTML.
- Pressespiegel: per language.
- Press releases: posts tagged `press`.

**Translations.** Polylang pairs become a shared `translationKey`, which drives the language switcher and the hreflang tags.

**Comments.** 14 existing comments are frozen into frontmatter as static content. See Decision 3.

**Media.**
- Download every referenced `wp-content/uploads` file (about 350, about 170 MB raw).
- Downscale originals to at most 2400 px and re-encode, targeting under 60 MB in git.
- Images go into `src/assets/…`; PDFs into `public/docs/`, including the Satzung and Zuwendungsbestätigung.
- Rewrite every link, including the legacy `http://18.159.120.6` and absolute `www.wewater.org` links.

**Static images and videos.** Copy only the files actually referenced; today's `static/` is 423 MB, mostly unused. Re-encode hero videos to H.264 + AV1 at sane bitrates.

**UI strings.**
- Port `translation.json` and the `page_*.json` namespaces to typed dictionaries.
- Drop the dead namespaces from the removed in-site shop: checkout, warenkorb, versand, shop, contact.
- Add the 5 missing French tutorial video keys.

## URLs, SEO, redirects

- **Same paths, trailing slashes kept:** `/`, `/blog/<slug>/`, `/projekte/<slug>/`, `/spenden/`, `/spenden/einmalig/`, `/spenden/monatlich/`, `/filtersystem/`, `/filtersysteme/{aqqabag,aqqacube,aqqasystem,tutorials}/`, `/team/`, `/presse/`, `/faq/`, `/unterstuetzen/`, `/impressum/`, `/dataprotection/`, and the `/en/…` and `/fr/…` variants.
- **Cross-language duplicates.** Today every post and project is generated under all 3 prefixes, which creates about 360 duplicate URLs such as `/en/blog/<german-slug>/`. The rebuild generates each piece of content only in its own language and emits a 301 for each duplicate: to the translated version if one exists, otherwise to the original.
- **Existing redirects kept:** `/shop` → shop.wewater.org and `/spende` → `/spenden`. Add the `/en/` and `/fr/` variants.
- **Added (missing today):** canonical, hreflang alternates plus `x-default`, `og:image` per page (post or project hero, site default otherwise), `@astrojs/sitemap` with i18n, `robots.txt` that blocks deploy previews, web manifest, and JSON-LD (`NGO` organisation, `BlogPosting`).
- **Removed:** the client-side language auto-redirect from browser language/localStorage. It hurts SEO and is a surprising redirect. A gentle "auf Deutsch lesen?" hint could replace it later if wanted.

## Accessibility and correctness fixes (needed for 100)

- **Contrast.** Text and buttons in the primary blue fail; see Decision 4.
- **Markup.** Correct heading order, landmark regions, and real `<button>`/`<a>` elements instead of `div`s with click handlers. Visible focus states, `alt` text for every image (the schema enforces it), and labelled form controls.
- **Hard-coded German.** Translate the blog author box ("Von", "Min read", "Über den Autor").
- **Hyphenation.** Use CSS `hyphens: auto` with the correct `lang` instead of German hyphenation applied to every language.
- **Language prefixes.** Fix the links that drop the language prefix today, and the wrong "active" nav state on `/en` and `/fr`.

## Phases

| # | Phase | Output |
|---|---|---|
| 0 ✅ | **Setup** | Astro 7 skeleton, TypeScript, CI (check, build, Lighthouse CI, visual diff), Netlify site with deploy previews, `CLAUDE.md` with the editing guide for maintainers |
| 1 ✅ | **Design foundation** | Tokens, fonts, base layout, header with mega-menu, mobile menu, footer, language switcher, buttons, cards, the 5 header-overlay variants. Visual diff against the live site at 375, 768 and 1280 px. |
| 2 ✅ | **Content migration** | `migrate-wp.ts`, collection schemas, all posts, projects, team, FAQ, press and media in the repo, with translation pairing |
| 3 ✅ | **Static pages** | Home, Spenden (plus einmalig, monatlich), Filtersystem plus 4 subpages, Team, Presse, FAQ, Unterstützen, Impressum, Datenschutz, 404 |
| 4 ✅ | **Collection pages** | Blog index and post, Projekte index with filter, project page (intro tiles, tables, galleries, donation form, related blog posts) |
| 5 ✅ (analytics open) | **SEO and integrations** | Meta, sitemap, redirects, headers, analytics per Decision 2, Mailchimp form, PayPal buttons, betterplace per Decision 1 |
| 6 ◐ (automated checks done; phone pass and team review open) | **Verification** | Lighthouse 100 on every page type (mobile and desktop), visual diff sign-off, link check, manual pass on real phones, review by the WeWater team |
| 7 | **Cutover** | Point wewater.org at the new Netlify site. Keep wewaterbackend.org read-only for a transition period so old PDF links keep working. Watch 404s and fix redirects, then retire WordPress. |

Phases 3 and 4 can run in parallel once phases 1 and 2 land.

## Decisions

Approved 2026-11-18: the recommendation is taken for each decision below. Revisit any of them by updating this section.

**1. Betterplace donation form (the biggest Lighthouse factor).**
The form itself pulls in about 4 MB of Stripe and hCaptcha and sets third-party cookies. We cannot fix that inside the iframe.
- **Recommendation:** render a lightweight placeholder of the same size. Swap in the real iframe automatically when it scrolls near the viewport (IntersectionObserver), and immediately on click or focus.
  - Donors see the form exactly where it is today, and visitors who never scroll there don't download 4 MB.
  - Lighthouse measures the initial load, so pages score 100.
  - On `/spenden/` the form must therefore sit below the first screen. It does today.
- **Alternative:** an explicit "Spendenformular laden" click everywhere. Guaranteed scores, but one extra click for donors.

**2. Analytics and consent.**
Today the site runs GA4 plus a Google Ads tag, and the cookie banner auto-accepts on 10% scroll. That is not valid consent under GDPR.
- **Recommendation:** cookieless analytics (Plausible or Netlify Analytics). No banner is needed, there's no tracking-cookie penalty, and the script is under 1 KB.
- **Alternative:** if WeWater relies on Google Ads conversion tracking, keep GA4 and Ads behind a real opt-in banner that loads nothing until consent.

**3. Blog comments.**
They currently read and write live from WordPress (14 comments in total), which can't survive a CMS-free site.
- **Recommendation:** show the existing comments as static content and drop the comment form.

**4. Colour contrast.** *(updated 2026-11-18)*
The brand blue `#5ABEE6` has 2.1:1 contrast against white; 4.5:1 is needed for normal text.
- **Decided:** keep brand blue as the button and highlight colour, but with **navy text on it (8.8:1)** instead of white.
- Blue text on white (links, eyebrows) uses `#1878A8` (4.9:1).
- This keeps the light brand blue prominent and passes Lighthouse accessibility.

**5. Content to drop.**
- Amazon Smile banner (the programme ended in 2023)
- Facebook page-plugin iframe (third-party cookies) → a static link card
- The empty Instagram embed on `/unterstuetzen` → a link
- The unused contact form
- Dead shop translation namespaces
- The outdated sections of the privacy policy

The **Datenschutzerklärung must be rewritten** for the new setup. It names Matomo, Quantcast and others. That text needs an owner at WeWater; we can draft it.

**6. Styling approach.** *(updated 2026-11-18, user request)*
- **Decided:** one coherent design system instead of copying the old site's ad-hoc CSS. It stays true to the current look: Poppins, navy and brand blue, the grey-blue section background, rounded cards, soft shadows and photo heroes.
- **Built on:** Tailwind CSS v4 plus HeroUI v3's framework-agnostic styles (`@heroui/styles`: BEM classes and variant functions, no React, no runtime JS).
- **Tokens:** WeWater colours mapped onto HeroUI's semantic variables in `src/styles/tokens.css`.
- **Type scale:** fluid and rem-based (16px body, `clamp()` headings), with typography roles (`text-display`, `heading-1..3`, `eyebrow`, `lead`, `prose`).
- **Layout:** fluid gutters and section spacing, with `gap`-based layouts.
- **Living reference:** `/styleguide/`.
- **Trade-off:** the visual diff against the live site becomes a reference for structure and layout rather than a pixel-match gate.

**7. Animated icons (Lord-icon / Lottie).** *(updated 2026-11-19 after the polish review)*
- **Decided:** keep the animations.
- **How it works:** `AnimatedIcon` shows a static SVG poster immediately. It upgrades to the original Lottie animation (lottie-web light, about 47 KB gzipped, loaded once) only for icons near the viewport, and only after the first interaction or once the page is idle.
- **Not loaded at all:** without JavaScript, under `prefers-reduced-motion`, and during Lighthouse's measurement.

**8. Videos in git.**
- **Recommendation:** after re-encoding, the referenced videos should be roughly 30–60 MB, which is fine to keep in the repo.
- If they end up much larger, host them on Netlify Blobs or a YouTube/Vimeo facade instead.

## Maintaining the site with Claude

`CLAUDE.md` in this repo will describe:
- the folder layout
- how to add or edit a post, project, team member or FAQ entry in each language
- where images go and how to reference them
- how to add a UI string
- the commands (`npm run dev`, `npm run check`, `npm run build`)

The content schemas and `astro check` catch mistakes before a deploy. Every change goes through a pull request with a Netlify deploy preview and the Lighthouse/visual checks, so nothing reaches wewater.org unreviewed.

## Sources

- [Astro 7.0 release](https://astro.build/blog/astro-7/)
- [Astro releases 7.4.x](https://astrobuild.eu/en/releases)
- [Astro Fonts API](https://docs.astro.build/en/guides/fonts/)
- [Astro i18n routing](https://docs.astro.build/en/guides/internationalization/)
- [Astro images](https://docs.astro.build/en/guides/images/)
- [Astro vs Next.js for static sites](https://eastondev.com/blog/en/posts/dev/20251202-astro-vs-nextjs-static-site/)
- [Astro vs Next.js vs Eleventy for content sites in 2026](https://devtoolpicks.com/blog/astro-vs-nextjs-vs-eleventy-indie-hackers-2026)
- [Tailwind CSS v4.x releases](https://releases.sh/tailwind-css/tailwind-css.md)
- Package versions checked on the npm registry on 2026-11-18: astro 7.4.12, @astrojs/mdx 8.1.6, @astrojs/sitemap 3.7.5, tailwindcss 4.3.5, @lhci/cli 0.16.1, @playwright/test 1.65.1, @11ty/eleventy 3.1.8, next 16.4.6.

## Open items for WeWater (before cutover)

**Netlify and analytics**
- The Netlify project is `wewater-updated` (team steven-hille's team). It builds from `netlify.toml` and is being set up at preview.wewater.org.
- The code lives at `wewaterorg/wewater-astro` (private). Netlify still deploys from `christophmeise/wewater-astro` until the project is relinked to the WeWater repo.
- preview.wewater.org runs next to the live site, so it is kept out of search engines: `SITE_NOINDEX` in `netlify.toml` adds a noindex tag and header and drops the canonical (see `src/lib/indexing.ts`).
- preview.wewater.org and the deploy previews are password-protected. Netlify's own password protection needs a paid plan, so `netlify/edge-functions/password.ts` asks for the password stored in the `SITE_PASSWORD` environment variable in the Netlify UI (any username). Changing the password takes effect with the next deploy.
- Analytics (decision 2): no analytics script is installed yet. Choose a cookieless tool (Plausible or Netlify Analytics); adding its script also needs its origin in the CSP in `netlify.toml`.

**Legal review**
- Datenschutzerklärung (`src/pages/[...lang]/dataprotection.astro`): every change is marked with a `DATENSCHUTZ-REVIEW` comment in the source.
- Open question: does the betterplace form, which loads automatically when it scrolls into view, need consent under § 25 TDDDG? If yes, switch `DonationForm` to click-to-load.

**Content to confirm or translate**
- Product figures that differ between languages on the live site:
  - AQQAsystem lifespan: "5 Jahre" in German, "indefinitely" in English and French.
  - AQQAcube flow: 1000 l / 12 h in German, 400 l / 8 h in English and French.
- FAQ: the English and French pages show the German text, as on the live site, marked `contentLang: de`.
- Untranslated posts: the "English" and "French" press releases and the French Gulu report are German WordPress copies.
- New UI copy written during the rebuild (button labels, filter labels, notes): translations need a native check. Search for the string groups in `src/i18n/strings/`.
- Image descriptions: about 400 migrated content images have generic alt text such as "Title (Foto 3)".
- Team: Raphaela Küppers and Frank Paschen have no portrait or bio.

**Cutover (phase 7)**
1. Point wewater.org at the Netlify site. Delete the `[context.production.environment]` block with `SITE_NOINDEX` from `netlify.toml` so wewater.org gets indexed, and delete `netlify/edge-functions/password.ts` and the `SITE_PASSWORD` variable in Netlify so it is public.
2. Keep wewaterbackend.org online read-only for a while, so old PDF links in emails and on betterplace keep working.
3. Watch for 404s and add redirects to `public/_redirects`.
4. Retire WordPress and delete `scripts/migrate-wp/`.
