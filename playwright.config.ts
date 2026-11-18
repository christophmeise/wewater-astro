import { defineConfig } from '@playwright/test';

/**
 * Visual comparison against the live site. `npm run test:visual` builds nothing:
 * run `npm run build` first; Playwright serves dist/ with `astro preview`.
 */
export default defineConfig({
  testDir: './tests',
  timeout: 120_000,
  fullyParallel: true,
  reporter: [['html', { open: 'never' }], ['list']],
  snapshotPathTemplate: '{testDir}/__screenshots__/{arg}{ext}',
  use: {
    baseURL: 'http://localhost:4321',
    // The old site redirects to /en/ or /fr/ based on the browser language; keep it on German.
    locale: 'de-DE',
  },
  webServer: {
    command: 'npm run preview -- --port 4321',
    url: 'http://localhost:4321',
    reuseExistingServer: !process.env['CI'],
  },
});
