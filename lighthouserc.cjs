/**
 * Lighthouse CI. Every route with "lighthouse": true in tests/routes.json must score 100
 * in all four categories. Run `npm run build` first, then `npm run lighthouse`
 * (mobile) or `LIGHTHOUSE_PRESET=desktop npm run lighthouse`.
 */
const { routes } = require('./tests/routes.json');

const desktop = process.env.LIGHTHOUSE_PRESET === 'desktop';

module.exports = {
  ci: {
    collect: {
      staticDistDir: './dist',
      url: routes.filter((r) => r.lighthouse).map((r) => `http://localhost${r.path}`),
      numberOfRuns: 3,
      settings: {
        ...(desktop ? { preset: 'desktop' } : {}),
        onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
        // Robots/canonical checks would flag localhost; SEO is still scored on everything else.
        skipAudits: ['is-crawlable', 'canonical'],
        chromeFlags: '--headless=new --no-sandbox',
      },
    },
    assert: {
      assertions: {
        'categories:performance': ['error', { minScore: 1, aggregationMethod: 'median-run' }],
        'categories:accessibility': ['error', { minScore: 1 }],
        'categories:best-practices': ['error', { minScore: 1 }],
        'categories:seo': ['error', { minScore: 1 }],
      },
    },
    upload: {
      // Reports stay local / in the CI artifact instead of a public upload service.
      target: 'filesystem',
      outputDir: './.lighthouseci/reports',
    },
  },
};
