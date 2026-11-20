import { readFile, stat, mkdir, unlink } from 'node:fs/promises';
import { resolve, dirname, extname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
const { chromium } = await import(process.env.PW_ENTRY ?? 'playwright-core');
const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, 'app');
const screenshots = resolve(here, 'screenshots');
const shots = JSON.parse(await readFile(resolve(here, 'shots.json'), 'utf8'));
const mime = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8', '.jpg': 'image/jpeg', '.png': 'image/png' };
await mkdir(screenshots, { recursive: true });
for (const name of ['1-checklist.jpg', '2-silver.jpg', '3-bronze.jpg']) {
  try { await unlink(resolve(screenshots, name)); } catch (error) { if (error.code !== 'ENOENT') throw error; }
}
if (!process.env.CHROME_PATH) throw new Error('Set CHROME_PATH to chrome-headless-shell.');
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH, args: ['--no-sandbox', '--disable-dev-shm-usage'] });
try {
  const context = await browser.newContext({ serviceWorkers: 'block' });
  const page = await context.newPage();
  await page.route('**/*', route => route.abort());
  await page.route('http://guide.local/**', async route => {
    try {
      const url = new URL(route.request().url());
      const path = decodeURIComponent(url.pathname);
      const file = resolve(root, '.' + (path.endsWith('/') ? path + 'index.html' : path));
      if (file !== root && !file.startsWith(root + sep)) return route.fulfill({ status: 404, body: 'Not found' });
      const body = await readFile(file);
      await route.fulfill({ status: 200, contentType: mime[extname(file)] ?? 'application/octet-stream', body });
    } catch { await route.fulfill({ status: 404, body: 'Not found' }); }
  });
  for (const shot of shots) {
    await page.setViewportSize(shot.viewport);
    await page.goto('http://guide.local' + shot.path);
    await page.waitForSelector('.trophy-row');
    await page.waitForTimeout(350);
    const file = resolve(screenshots, shot.file);
    await page.screenshot({ path: file, type: 'jpeg', quality: 82 });
    console.log(`${shot.file}: ${(await stat(file)).size} bytes`);
  }
  await context.close();
} finally { await browser.close(); }
