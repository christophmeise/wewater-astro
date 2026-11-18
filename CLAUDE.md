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
| Blog posts, projects, team, FAQ, press list | `src/content/` (schemas in `src/content.config.ts`), see [Content](#content) |
| Components for use inside posts and projects | `src/components/content/` |
| Categories, authors, document links | `src/data/categories.ts`, `src/data/authors.ts`, `src/data/docs.ts` |
| Photos used in posts and projects | `src/assets/wp/<yyyy>/<mm>/` (migrated), `src/assets/team/`, `src/assets/authors/` |
| PDFs, videos | `public/docs/`, `public/media/` |
| Redirects of old content URLs | `public/_redirects` |

## Content

All content is in `src/content/`. Every file is checked against the schemas in `src/content.config.ts` when you run `npm run check` or `npm run build`. A wrong category, a missing image or a missing field fails the build with the file name.

The WordPress migration (`npm run migrate:wp`) is finished. The files in `src/content/`, `src/assets/{wp,team,authors}/`, `public/docs/`, `public/media/`, `src/data/*.ts` and `public/_redirects` are now the source of truth and are edited by hand. Do not re-run the script: it would overwrite those edits, so it refuses unless `--overwrite-hand-edits` is passed. It gets deleted after cutover.

### Blog post

1. Create `src/content/blog/<lang>/<slug>.mdx`, for example `src/content/blog/de/neuer-brunnen-in-kenia.mdx`. The file name is the URL: `/blog/neuer-brunnen-in-kenia/` (German), `/en/blog/<slug>/`, `/fr/blog/<slug>/`. Use lowercase, hyphens, no umlauts (`ue` for `ü`).
2. Frontmatter:

   ```yaml
   ---
   title: Neuer Brunnen in Kenia
   date: 2027-03-01T10:00:00Z
   lang: de                       # must match the folder
   translationKey: neuer-brunnen-in-kenia   # same value in every translation (the German slug)
   author: thilo                  # key in src/data/authors.ts
   categories: [kenia-projekte-2021, aqqacube-projekt]   # keys in src/data/categories.ts; the first 3 show on cards
   hero: ../../../assets/blog/2027/03/brunnen.jpg       # path relative to this file
   heroAlt: Kinder holen Wasser am neuen Brunnen         # in the post's language
   excerpt: Ein, zwei Sätze für die Karte in der Blog-Übersicht.
   description: Meta description for search results, about 150 characters.
   ---
   ```

3. Write the text in Markdown below the frontmatter. Use `##` for section headings (the page title is the only `h1`), then `###`; don't skip levels.
4. Put new photos in `src/assets/blog/<yyyy>/<mm>/` (at most 2400 px wide, under about 1 MB). Show them with `![Alt text](../../../assets/blog/2027/03/foto.jpg)` or, with a caption, with `<Figure>` (see below).
5. `comments` (frozen WordPress comments) only exist on migrated posts; there is no comment form.

### Project

`src/content/projects/<lang>/<slug>.mdx` -> `/projekte/<slug>/`. Same `title`, `date`, `lang`, `translationKey`, `hero`, `heroAlt`, `description` as a post, plus:

```yaml
status: in-progress            # or completed: drives the filter on /projekte/
filters: [aqqacube]            # aqqabag and/or aqqacube: lists the project on that filter page
categories: [dr-kongo]         # region/campaign categories
blogCategory: dr-kongo         # optional: posts in this category appear as "Projektupdates im Blog"
```

A project usually starts with `<IntroTiles>`, then text, images, a `<Gallery>`, the cost table (a Markdown table) and a `<DonationForm>`. Copy an existing project as a template, for example `src/content/projects/de/sauberes-trinkwasser-fuer-die-schule-uvira.mdx`.

### Translations

A translation is a second file with the same `translationKey` in another language folder, for example `src/content/blog/en/new-well-in-kenya.mdx` with `lang: en` and `translationKey: neuer-brunnen-in-kenia`. The slug can differ per language. Files with the same key are linked by the language switcher and hreflang tags. A post without a translation only exists in its own language. Never add a second file with the same key in the same language (the build fails).

When you rename or delete a post or project, add a 301 line to `public/_redirects` from the old URL to the new one.

### Components in posts and projects

Import them at the top of the `.mdx` file (after the frontmatter), for example `import Figure from '@/components/content/Figure.astro';`. Image `src` values are paths below `src/assets/`.

| Component | Use |
|---|---|
| `<Figure src="wp/2026/11/foo.jpg" alt="…">Caption with **Markdown**</Figure>` | Image with optional caption; `href="…"` makes it a link |
| `<Gallery columns={3} images={[{ src: "…", alt: "…", caption: "…" }]} />` | Photo grid with a lightbox |
| `<IntroTiles subtitle="Projektdetails" title="Ort, Land" tiles={[{ title: "Land", text: "…" }, …]} />` | The four project detail tiles (icons: pin, map, list, people) |
| `<Columns>` + `<Column>` | Side-by-side blocks; leave a blank line around Markdown inside each `<Column>` |
| `<YouTube id="qHDE8HboDBk" title="…" />` | YouTube video (loads only on click) |
| `<DonationForm src="https://www.betterplace.org/de/donate/iframe/projects/68773?…" />` | betterplace donation form, loaded when the reader scrolls near it |
| `<FacebookPost href="https://www.facebook.com/…" />` | Link card to a Facebook post |
| `<Video src="/media/clip.mp4" poster="wp/…-poster.jpg" width={…} height={…} />` | Self-hosted video from `public/media/` |

### Team member

One file for all languages: `src/content/team/<slug>.md`. Frontmatter: `name`, `order` (position on /team/, ascending), `photo` (`../../assets/team/<slug>.jpg`), `photoAlt`, `role: { de, en, fr }`, `description: { de, en, fr }` (plain text; blank line between paragraphs) and optional `links: { email, website, linkedin, instagram, facebook, twitter }`. If the person also writes blog posts, add them to `src/data/authors.ts`.

### FAQ

One file per question: `src/content/faq/<lang>/<nn>-<slug>.md`. Frontmatter: `question`, `section` (heading it is grouped under), `order` (ascending, steps of 10 leave room to insert), `lang`. The answer is the Markdown body. The English and French FAQ still contain the German text from WordPress and are marked `contentLang: de`; when you translate an entry, replace the text and remove `contentLang`.

### Press

- The press coverage list ("Pressespiegel") is `src/content/press/<lang>.md`: add a line to the list in each language.
- Press releases are blog posts with the category `presse`.
- Documents (PDFs) go in `public/docs/`. Link them as `/docs/<file>.pdf`; pages that need a fixed document use `src/data/docs.ts`.

### Categories and authors

- Categories: `src/data/categories.ts`. Each key has a label per language and an optional dot colour.
- Authors: `src/data/authors.ts`. Each key has a name, an optional portrait and an "about the author" text per language.
- Add a new key there before using it in frontmatter.

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
