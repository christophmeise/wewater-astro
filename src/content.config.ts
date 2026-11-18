/**
 * Content collections. Every file in src/content/ is validated against these schemas at build
 * time (`npm run check` / `npm run build`): a typo in a category, a missing image or a missing
 * translation field fails the build instead of reaching the site.
 *
 * How to add or edit content: see "Content" in CLAUDE.md.
 */
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { LOCALES } from '@/i18n/locales';
import { categoryKeys } from '@/data/categories';
import { authorKeys } from '@/data/authors';

const locale = z.enum(LOCALES);

/** One text per language; all three are required. */
const translated = z.object({ de: z.string(), en: z.string(), fr: z.string() });

/** Fields shared by blog posts and projects. */
const entryFields = {
  title: z.string().min(1),
  /** Publication date (ISO 8601). Lists are sorted by it, newest first. */
  date: z.coerce.date(),
  /** Language of this file. Must match the folder: src/content/blog/<lang>/. */
  lang: locale,
  /**
   * Shared by all translations of the same post/project (the German slug by convention).
   * Drives the language switcher and hreflang links.
   */
  translationKey: z.string().min(1),
  /** Alt text of the hero image, in the language of the file. */
  heroAlt: z.string().min(1),
  /** Meta description (search results, social cards). About 150 characters. */
  description: z.string().optional(),
  /** WordPress post id, kept for reference while the migration is re-run. */
  wpId: z.number().int().optional(),
};

/** A frozen WordPress comment (decision 3: shown read-only, no comment form). */
const comment = z.object({
  id: z.number().int(),
  /** id of the comment this one replies to. */
  parentId: z.number().int().optional(),
  author: z.string(),
  date: z.coerce.date(),
  /** "pingback"/"trackback" for automatic link notices from other posts; absent for normal comments. */
  type: z.enum(['pingback', 'trackback']).optional(),
  /** Comment body as sanitised HTML (from WordPress). */
  html: z.string(),
});

/** Blog posts: src/content/blog/<lang>/<slug>.mdx -> /blog/<slug>/, /en/blog/<slug>/, /fr/blog/<slug>/ */
const blog = defineCollection({
  loader: glob({ pattern: '*/*.mdx', base: './src/content/blog' }),
  schema: ({ image }) =>
    z.object({
      ...entryFields,
      /** Key in src/data/authors.ts. */
      author: z.enum(authorKeys),
      /** Keys in src/data/categories.ts. The first three are shown on cards. */
      categories: z.array(z.enum(categoryKeys)).default([]),
      /** Hero image, relative to this file (usually ../../../assets/wp/<yyyy>/<mm>/<file>). */
      hero: image(),
      /** Teaser text for cards (plain text). */
      excerpt: z.string().optional(),
      comments: z.array(comment).default([]),
    }),
});

/** Projects: src/content/projects/<lang>/<slug>.mdx -> /projekte/<slug>/ (+ /en/, /fr/) */
const projects = defineCollection({
  loader: glob({ pattern: '*/*.mdx', base: './src/content/projects' }),
  schema: ({ image }) =>
    z.object({
      ...entryFields,
      /** Filter on /projekte/ ("In Arbeit" / "Abgeschlossen"). */
      status: z.enum(['in-progress', 'completed']),
      /** Filter systems used; lists the project on /filtersysteme/aqqabag/ and /filtersysteme/aqqacube/. */
      filters: z.array(z.enum(['aqqabag', 'aqqacube'])).default([]),
      /** Other categories (region, campaign), keys in src/data/categories.ts. */
      categories: z.array(z.enum(categoryKeys)).default([]),
      /** "Projektupdates im Blog": blog posts in this category (same language) are listed below the project. */
      blogCategory: z.enum(categoryKeys).optional(),
      hero: image(),
    }),
});

/** Team members: src/content/team/<slug>.md, one file for all three languages. */
const team = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/team' }),
  schema: ({ image }) =>
    z.object({
      name: z.string(),
      /** Position on /team/ (ascending). */
      order: z.number(),
      /** Portrait, relative to this file (../../assets/team/<slug>.jpg). */
      photo: image(),
      photoAlt: z.string().min(1),
      /** Short role ("Co-Founder"). */
      role: translated,
      /** Bio, plain text; separate paragraphs with a blank line. */
      description: translated,
      links: z
        .object({
          email: z.email().optional(),
          website: z.url().optional(),
          linkedin: z.url().optional(),
          instagram: z.url().optional(),
          facebook: z.url().optional(),
          twitter: z.url().optional(),
        })
        .default({}),
      wpId: z.number().int().optional(),
    }),
});

/**
 * FAQ: one file per question, src/content/faq/<lang>/<nn>-<slug>.md. The body is the answer
 * (Markdown). Questions are grouped by `section` and sorted by `order`.
 */
const faq = defineCollection({
  loader: glob({ pattern: '*/*.md', base: './src/content/faq' }),
  schema: z.object({
    question: z.string().min(1),
    /** Section heading the question is listed under (e.g. "WeWater Allgemein"). */
    section: z.string().min(1),
    order: z.number(),
    lang: locale,
    /**
     * Language the text is actually written in, when it differs from `lang` (the English and
     * French FAQ were never translated in WordPress). Pages set lang="de" on such entries.
     */
    contentLang: locale.optional(),
  }),
});

/** Press coverage list ("Pressespiegel"): src/content/press/<lang>.md. */
const press = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/press' }),
  schema: z.object({
    title: z.string(),
    lang: locale,
  }),
});

export const collections = { blog, projects, team, faq, press };
