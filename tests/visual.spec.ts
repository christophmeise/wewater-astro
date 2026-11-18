import { expect, test, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';

/**
 * Screenshots each ported page on the live site (www.wewater.org) and on the new build,
 * then compares them. The live screenshot becomes the reference image for that run.
 * Dynamic parts (iframes, videos, counters, cookie banner, animations) are hidden on both sides.
 */
const LIVE = 'https://www.wewater.org';
const WIDTHS = [375, 768, 1280];
const { routes } = JSON.parse(readFileSync(new URL('./routes.json', import.meta.url), 'utf8')) as {
  routes: { path: string; visual: boolean }[];
};

const STABILISE_CSS = `
  /* The old site scrolls <body> instead of the window; undo that so full-page screenshots work. */
  html, body, body > div { overflow-x: clip !important; overflow-y: visible !important; max-height: none !important; height: auto !important; }
  iframe, video, .CookieConsent, [data-dynamic] { visibility: hidden !important; }
  [data-sal] { opacity: 1 !important; transform: none !important; }
  *, *::before, *::after { animation: none !important; transition: none !important; caret-color: transparent !important; }
`;

async function settle(page: Page) {
  await page.addStyleTag({ content: STABILISE_CSS });
  await page.evaluate(() => document.fonts.ready);
  // Trigger lazy images by scrolling through the page once.
  await page.evaluate(async () => {
    const scroller = document.scrollingElement ?? document.body;
    for (let y = 0; y < scroller.scrollHeight; y += 600) {
      scroller.scrollTo(0, y);
      document.body.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 50));
    }
    scroller.scrollTo(0, 0);
    document.body.scrollTo(0, 0);
  });
  await page.waitForLoadState('networkidle');
}

for (const route of routes.filter((r) => r.visual)) {
  for (const width of WIDTHS) {
    const name = `${route.path.replace(/^\/|\/$/g, '').replaceAll('/', '_') || 'home'}-${width}.png`;

    test(`${route.path} @ ${width}px matches live site`, async ({ page, context }, testInfo) => {
      await page.setViewportSize({ width, height: 900 });
      // Pre-decline the old site's cookie banner so it does not cover the page.
      await context.addCookies([
        { name: 'gatsby-gdpr-google-analytics', value: 'false', domain: 'www.wewater.org', path: '/' },
      ]);

      await page.goto(LIVE + route.path);
      await settle(page);
      await page.screenshot({ path: testInfo.snapshotPath(name), fullPage: true });

      await page.goto(route.path);
      await settle(page);
      await expect(page).toHaveScreenshot(name, { fullPage: true, maxDiffPixelRatio: 0.03 });
    });
  }
}
