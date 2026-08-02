/**
 * Side-by-side verification: screenshots the design prototype and the built
 * app, both themes, plus app tabs, settings modal, and the send flow.
 *
 * Usage:
 *   python -m http.server 8100 --directory design &   # prototype
 *   (cd src && python serve.py) &                     # app on :8000
 *   NODE_PATH=$(npm root -g) CDN_DIR=/path/to/cdn node verify/screenshot.mjs [outdir]
 *
 * CDN_DIR (optional) holds offline copies of the prototype's CDN deps and
 * Google Fonts (react.js, react-dom.js, babel.js, fonts.css, fonts/*.woff2);
 * when set, those requests are fulfilled locally so no proxy is needed.
 */
import { mkdirSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';

// NODE_PATH only applies to CJS resolution, so pull playwright in via require.
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');

const OUT = process.argv[2] ?? 'verify/screenshots';
const CDN = process.env.CDN_DIR;
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: 1440, height: 900 },
  ignoreHTTPSErrors: true,
});

if (CDN) {
  const serve = (path, contentType) => (route) =>
    route.fulfill({ body: readFileSync(path), contentType });
  await page.route('**/react@18.3.1/**', serve(`${CDN}/react.js`, 'application/javascript'));
  await page.route('**/react-dom@18.3.1/**', serve(`${CDN}/react-dom.js`, 'application/javascript'));
  await page.route('**/@babel/standalone**', serve(`${CDN}/babel.js`, 'application/javascript'));
  await page.route('https://fonts.googleapis.com/**', serve(`${CDN}/fonts.css`, 'text/css'));
  await page.route('https://fonts.gstatic.com/**', (route) => {
    const name = new URL(route.request().url()).pathname.split('/').pop();
    route.fulfill({ body: readFileSync(`${CDN}/fonts/${name}`), contentType: 'font/woff2' });
  });
}

async function shoot(name) {
  await page.screenshot({ path: `${OUT}/${name}.png` });
  console.log(`captured ${name}`);
}

async function themePair(prefix) {
  await shoot(`${prefix}-dark`);
  await page.click('div[title="Toggle theme"]');
  await page.waitForTimeout(500);
  await shoot(`${prefix}-light`);
  await page.click('div[title="Toggle theme"]');
  await page.waitForTimeout(500);
}

// --- prototype ------------------------------------------------------------
await page.goto('http://localhost:8100/Sonar.dc.html', { waitUntil: 'load' });
await page.waitForSelector('text=SONAR', { timeout: 30000 });
await page.waitForTimeout(3000); // fonts + CDN React render
await themePair('proto');

// --- app ------------------------------------------------------------------
await page.goto('http://localhost:8000/', { waitUntil: 'load' });
await page.waitForSelector('text=SONAR', { timeout: 30000 });
await page.waitForTimeout(2500);
await themePair('app');

for (const tab of ['Report', 'Charts', 'Data', 'Saved', 'Transcripts']) {
  await page.click(`div:text-is("${tab}")`);
  await page.waitForTimeout(400);
  await shoot(`app-tab-${tab.toLowerCase()}`);
}

await page.click('div[title="Settings"]');
await page.waitForTimeout(400);
await shoot('app-settings-profile');
for (const [label, name] of [
  ['Appearance', 'appearance'],
  ['Data pipeline', 'pipeline'],
  ['Labeling prompts', 'prompts'],
]) {
  await page.click(`div:text-is("${label}")`);
  await page.waitForTimeout(300);
  await shoot(`app-settings-${name}`);
}
await page.mouse.click(20, 450); // backdrop click closes

// empty state + send flow
await page.click('text=New conversation');
await page.waitForTimeout(500);
await shoot('app-empty-state');
await page.click('text=Primary call drivers last week');
await page.waitForTimeout(900); // thinking indicator with first label
await shoot('app-thinking');
await page.waitForTimeout(6000); // stream completes
await shoot('app-streamed-reply');

await browser.close();
console.log('done');
