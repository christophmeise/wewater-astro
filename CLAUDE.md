# WeWater website

Static website for [wewater.org](https://www.wewater.org), built with Astro 7. There is no CMS: every page, blog post, project and team member is a file in this repo. Maintainers change the site by editing these files (usually by asking Claude), opening a pull request and merging it after the checks pass. Netlify deploys `main` to wewater.org.

The rebuild plan and status are in [PLAN.md](PLAN.md).

## Commands

Node 24 (see `.nvmrc`). Run `nvm use` first.

| Command | What it does |
|---|---|
| `npm run dev` | Local dev server at http://localhost:4321 |
| `npm run check` | Type-check pages, components, translations and content |
| `npm run build` | Build the static site into `dist/` |
| `npm run preview` | Serve `dist/` locally |
| `npm run lighthouse` | Lighthouse on the built site, must be 100 in every category. `LIGHTHOUSE_PRESET=desktop npm run lighthouse` for desktop |
| `npm run test:visual` | Screenshot comparison against the live wewater.org (run `npm run build` first) |

Before opening a pull request, `npm run check` and `npm run build` must pass.

## Languages and URLs

- German is the default and has no prefix: `/spenden/`. English is `/en/spenden/`, French `/fr/spenden/`.
- URLs always end with `/`.
- Pages that exist in all three languages live in `src/pages/[...lang]/` and use `localeStaticPaths` from `src/i18n`.
- Never hard-code a German link inside a component. Use `localizePath('/spenden/', locale)`.

## Where things are

| What | Where |
|---|---|
| UI text (buttons, menus, labels) | `src/i18n/strings/<group>.ts`: one file per area, each string with `de`, `en` and `fr` side by side |
| Pages | `src/pages/` |
| Layout, `<head>`, SEO tags | `src/layouts/BaseLayout.astro`, `src/components/Seo.astro` |
| Components | `src/components/` |
| Colours, fonts, base typography | `src/styles/global.css` |
| Images used by pages | `src/assets/` |
| Files served as-is (PDFs, favicon) | `public/` |
| Redirects, headers, CSP | `netlify.toml` |
| Pages checked by Lighthouse/visual CI | `tests/routes.json` |

Blog posts, projects, team members and FAQ move into `src/content/` in phase 2. This guide gets a section for each when they land.

## Rules for editing

**Text and translations**
- UI strings are grouped by area in `src/i18n/strings/` (for example `nav.ts`, `footer.ts`, `spenden.ts`). Each key holds `{ de, en, fr }`; TypeScript fails the build if a language is missing. New group files must be registered in `src/i18n/strings/index.ts`.
- In components: `const t = useTranslations(locale); t('nav.donate')`.
- When adding German text, add the English and French version in the same change. If no translation is available yet, ask the user instead of copying the German text.

**Styling: the design system**

The site has one design system: Tailwind CSS v4 utilities plus HeroUI v3 component classes from `@heroui/styles`. HeroUI is used CSS-only, so there is no React and no JavaScript; its classes and variant functions compile to static CSS. Open `/styleguide/` (run `npm run dev`) to see every token and component.

- **Tokens.** Colours, type scale, radii and spacing live in `src/styles/tokens.css`. Use the semantic utilities they generate: `bg-background`, `bg-background-secondary`, `text-foreground`, `text-muted`, `bg-accent`, `text-link`, `bg-brand-orange`, `rounded-3xl`, `shadow-surface`. Never add raw hex values or one-off pixel sizes in components. If something new is needed, add a token in `tokens.css` and show it in the styleguide.
- **Typography roles.** Use these instead of picking font sizes:
  - `text-display`: hero headline
  - `heading-1`: page title
  - `heading-2`: section title
  - `heading-3`: card title
  - `eyebrow`: small blue kicker above a title
  - `lead`: intro paragraph
  - `prose`: long-form content such as blog posts, projects and legal pages

  The type scale is fluid (`clamp()`) and rem-based, and body text is 16px. Never set font sizes in px.
- **Layout.** `container-page` for the 1200px page container with fluid side padding. `section` for vertical rhythm between sections, plus `section--muted` for the grey-blue background. Space children with `flex`/`grid` and `gap-*`, not margins.
- **Components.** Use HeroUI classes through their variant functions in the frontmatter, for example `import { buttonVariants } from '@heroui/styles'` then `<a class={buttonVariants({ variant: 'primary' })}>`. For components with slots, call the slot: `chipVariants({ color: 'accent' }).base()`. WeWater-specific variants (for example `button--inverted` for outline buttons on photos) live in `src/styles/global.css`.
  - If you start using a HeroUI component that isn't imported yet, add its `@import '@heroui/styles/components/<name>.css'` line in `global.css`.
  - HeroUI component docs list the BEM classes. Interactive components (menus, popovers, modals) need their state set via `data-*` attributes or native elements like `<details>` and `<dialog>`.
- **Contrast.**
  - Brand blue (`accent`, #5ABEE6) is for backgrounds, buttons and decoration, with navy text on it.
  - For blue text on white, use `text-link` (#1878A8).
  - White text only goes on navy, on photos with an overlay, or on `link` blue.
- **Component-specific CSS.** Write it in a `<style>` block in the component (Astro scopes it), using the tokens via `var(--…)` or `@apply`. Prefer utilities first.
- **Breakpoints.** Tailwind defaults: `sm` 40rem, `md` 48rem (768px), `lg` 64rem (1024px), `xl` 80rem. Mobile-first: unprefixed utilities are for phones, `md:` and up for larger screens.

**Images**
- Put images in `src/assets/` and render them with `<Picture>` or `<Image>` from `astro:assets`. Never put photos in `public/`: those are not optimised.
- Every image needs meaningful `alt` text in the page's language. Use `alt=""` only for purely decorative images.
- The single largest image at the top of a page (the hero) gets `loading="eager"` and `fetchpriority="high"`. Every other image stays lazy, which is the default.
- Keep originals at most 2400 px wide and under about 1 MB. Astro generates the smaller sizes.

**JavaScript**
- The site ships no JavaScript framework. Prefer HTML and CSS: `<details>` for accordions, CSS scroll-snap for carousels, `:has()` for filters.
- If a script is unavoidable, keep it small, put it in the component in a `<script>` tag, and make sure the page still works without it.

**Third-party embeds**
- YouTube: use the lite YouTube component (`@astro-community/astro-embed-youtube`), never a raw iframe.
- Any new external iframe, script, image host or form target must also be added to the `Content-Security-Policy` in `netlify.toml`, or browsers will block it.

**Performance is a requirement**
CI fails if any page in `tests/routes.json` drops below 100 in Lighthouse performance, accessibility, best practices or SEO. When adding a page, add it to `tests/routes.json`.

## Deploys

- Every pull request gets a Netlify deploy preview. Previews are not indexed by search engines; `src/pages/robots.txt.ts` handles that.
- Merging to `main` deploys to production.
- The CI workflow (`.github/workflows/ci.yml`) runs check, build, internal link check, Lighthouse (mobile and desktop) and the visual comparison. The visual comparison is informational until the rebuild is signed off.
