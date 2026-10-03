// 品牌资产检查：favicon / apple-touch-icon / 分享图 / 页脚官方标识是否真的能加载（HTTP 200 且非空）
import { chromium } from 'playwright';

const BASE = process.env.BASE || 'http://localhost:1515';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 950 } });

const failed = [];
page.on('response', r => { if (r.status() >= 400) failed.push(`${r.status()} ${r.url()}`); });

await page.goto(BASE + '/', { waitUntil: 'load' });
await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
await page.waitForTimeout(1200);
const result = await page.evaluate(async () => {
  const out = {};
  const footerImg = document.querySelector('.footer-mark img');
  out.footerLogo = footerImg ? { src: footerImg.getAttribute('src'), naturalWidth: footerImg.naturalWidth, complete: footerImg.complete } : null;
  const icon = document.querySelector('link[rel="icon"][type="image/svg+xml"]');
  const apple = document.querySelector('link[rel="apple-touch-icon"]');
  out.iconHref = icon && icon.getAttribute('href');
  out.appleHref = apple && apple.getAttribute('href');
  out.ogImage = document.querySelector('meta[property="og:image"]')?.getAttribute('content');
  out.title = document.title;
  // 逐一请求，确认真能取到
  const probe = async (u) => { try { const r = await fetch(u); return r.ok ? r.status : r.status; } catch (e) { return 'ERR'; } };
  out.iconStatus = await probe(icon?.getAttribute('href') || '/favicon.svg');
  out.appleStatus = await probe(apple?.getAttribute('href') || '/apple-touch-icon.png');
  out.ogStatus = await probe('/images/og-image.png');
  return out;
});

console.log(JSON.stringify(result, null, 1));
await page.locator('.footer-mark').screenshot({ path: '.testing/footer-mark.png' }).catch(e => console.log('截图失败', e.message));
console.log('HTTP 失败请求:', failed.length ? failed : '无');
await browser.close();
process.exit(failed.length || !result.footerLogo?.naturalWidth ? 1 : 0);
