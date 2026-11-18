// Render frame 0 of each baked animation with lottie_light and save it as a static SVG poster
// (the inline image AnimatedIcon shows before, or instead of, the animation).
//
//   node scripts/animations/posters.mjs [name ...]   (default: every src/assets/animations/*.json)
import { createRequire } from 'node:module';
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const PLAYER = new URL('../../node_modules/lottie-web/build/player', import.meta.url).pathname;

const dir = new URL('../../src/assets/animations', import.meta.url).pathname;
const only = process.argv.slice(2);
const browser = await chromium.launch();
const page = await browser.newPage();
await page.setContent('<div id=c style="width:80px;height:80px"></div>');
await page.addScriptTag({ path: `${PLAYER}/lottie_light.min.js` });

for (const file of readdirSync(dir).filter((f) => f.endsWith('.json'))) {
  const name = file.replace(/\.json$/, '');
  if (only.length && !only.includes(name)) continue;
  const data = JSON.parse(readFileSync(`${dir}/${file}`, 'utf8'));
  const svg = await page.evaluate((data) => {
    const c = document.getElementById('c');
    c.innerHTML = '';
    const anim = window.lottie.loadAnimation({
      container: c,
      renderer: 'svg',
      loop: false,
      autoplay: false,
      animationData: data,
      rendererSettings: { preserveAspectRatio: 'xMidYMid meet', progressiveLoad: false, hideOnTransparent: true },
    });
    anim.goToAndStop(0, true);
    const root = c.querySelector('svg');
    // Elements hidden in this frame never show in a static poster.
    for (const el of [...root.querySelectorAll('[style*="display: none"]')]) el.remove();
    // The root clip to the 500x500 artboard duplicates the viewBox clipping.
    const rootGroup = root.querySelector(':scope > g[clip-path]');
    if (rootGroup) {
      const id = rootGroup.getAttribute('clip-path').match(/#([^)]+)/)[1];
      root.querySelector(`clipPath#${CSS.escape(id)}`)?.remove();
      rootGroup.removeAttribute('clip-path');
    }
    for (const defs of [...root.querySelectorAll('defs')]) if (!defs.children.length) defs.remove();
    for (const el of [root, ...root.querySelectorAll('*')]) {
      if (el.getAttribute('style') === '' || el.getAttribute('style') === 'display: block;') el.removeAttribute('style');
      if (el.getAttribute('opacity') === '1') el.removeAttribute('opacity');
      if (el.getAttribute('fill-opacity') === '1') el.removeAttribute('fill-opacity');
      if (el.getAttribute('stroke-opacity') === '1') el.removeAttribute('stroke-opacity');
      if (el.getAttribute('transform') === 'matrix(1,0,0,1,0,0)') el.removeAttribute('transform');
    }
    root.removeAttribute('width');
    root.removeAttribute('height');
    root.removeAttribute('style');
    if (!root.querySelector('use')) root.removeAttribute('xmlns:xlink');
    // Collapse groups that carry no attributes at all.
    for (const g of [...root.querySelectorAll('g')].reverse()) {
      if (!g.attributes.length) g.replaceWith(...g.childNodes);
    }
    anim.destroy();
    return root.outerHTML;
  }, data);
  // Path data: one decimal is far below a pixel at icon sizes (paths are scaled up at most ~4x into a
  // 500-unit artboard). Everything else (transform scales) keeps three decimals.
  const round = (digits) => (n) => String(Math.round(Number(n) * 10 ** digits) / 10 ** digits);
  const rounded = svg
    .replace(/ d="([^"]*)"/g, (_, d) => ` d="${d.trim().replace(/-?\d+\.\d{2,}/g, round(1))}"`)
    .replace(/-?\d+\.\d{4,}/g, round(3));
  writeFileSync(`${dir}/${name}.svg`, rounded + '\n');
  console.log(name, svg.length);
}
await browser.close();
