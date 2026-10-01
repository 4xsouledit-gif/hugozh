import { chromium } from 'playwright';
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
await p.goto('http://localhost:1516/', { waitUntil: 'load' });
const info = await p.evaluate(() => {
  const i = document.querySelector('.hero-logo');
  const r = i && i.getBoundingClientRect();
  return { src: i?.getAttribute('src'), naturalWidth: i?.naturalWidth, shownWidth: r && Math.round(r.width), shownHeight: r && Math.round(r.height) };
});
console.log('hero logo:', JSON.stringify(info));
await p.locator('.hero').screenshot({ path: '.testing/hero.png' });
await b.close();
