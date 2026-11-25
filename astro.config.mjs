// @ts-check
import { defineConfig, fontProviders } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { appendFile } from 'node:fs/promises';
import { allowIndexing } from './src/lib/indexing.ts';

const LOCALES = ['de', 'en', 'fr'];
const DEFAULT_LOCALE = 'de';

/**
 * Builds that must not be indexed (src/lib/indexing.ts) also send X-Robots-Tag: noindex on every
 * response, so PDFs and images stay out of search too. Netlify merges dist/_headers with the
 * headers in netlify.toml.
 */
const noindexHeader = {
  name: 'wewater:noindex-header',
  hooks: {
    'astro:build:done': async ({ dir }) => {
      if (allowIndexing) return;
      await appendFile(new URL('_headers', dir), '/*\n  X-Robots-Tag: noindex\n');
    },
  },
};

export default defineConfig({
  site: 'https://www.wewater.org',
  output: 'static',
  // Same URL shape as the old Gatsby site: /blog/foo/ with a trailing slash.
  trailingSlash: 'always',
  build: {
    format: 'directory',
    // Small stylesheets are inlined into the HTML, so there is no render-blocking CSS request.
    inlineStylesheets: 'auto',
  },

  i18n: {
    locales: LOCALES,
    defaultLocale: DEFAULT_LOCALE,
    routing: {
      // German lives at /, English at /en/, French at /fr/ (as today).
      prefixDefaultLocale: false,
      redirectToDefaultLocale: false,
    },
  },

  fonts: [
    {
      name: 'Poppins',
      cssVariable: '--font-poppins',
      provider: fontProviders.local(),
      fallbacks: ['Helvetica Neue', 'Arial', 'sans-serif'],
      options: {
        variants: [
          { src: ['./src/assets/fonts/poppins-v15-latin-300.woff2'], weight: 300, style: 'normal' },
          { src: ['./src/assets/fonts/poppins-v15-latin-regular.woff2'], weight: 400, style: 'normal' },
          { src: ['./src/assets/fonts/poppins-v15-latin-500.woff2'], weight: 500, style: 'normal' },
          { src: ['./src/assets/fonts/poppins-v15-latin-600.woff2'], weight: 600, style: 'normal' },
          { src: ['./src/assets/fonts/poppins-v15-latin-700.woff2'], weight: 700, style: 'normal' },
          { src: ['./src/assets/fonts/poppins-v15-latin-800.woff2'], weight: 800, style: 'normal' },
        ],
      },
    },
  ],

  image: {
    // Responsive srcset/sizes for every <Image>/<Picture> unless a component overrides it.
    layout: 'constrained',
  },

  vite: {
    plugins: [tailwindcss()],
  },

  integrations: [
    noindexHeader,
    mdx(),
    sitemap({
      // Internal pages that must not be indexed.
      filter: (page) => !page.includes('/styleguide/'),
      i18n: {
        defaultLocale: DEFAULT_LOCALE,
        locales: { de: 'de', en: 'en', fr: 'fr' },
      },
    }),
  ],
});
