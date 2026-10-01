// 把官方 hugo-logo-wide.svg 里的粉色六边形徽标，与 static/favicon.svg 渲染到同尺寸，供像素比对。
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(here, '..');
const SITE = path.join(ROOT, 'hugo-docs-zh', 'static');

const official = fs.readFileSync(path.join(SITE, 'images', 'hugo-logo-wide.svg'), 'utf8');
const ours = fs.readFileSync(path.join(SITE, 'favicon.svg'), 'utf8');

const SIZE = 512;
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: SIZE, height: SIZE }, deviceScaleFactor: 1 });

// 官方：整张宽 logo 按 1493×391 布局，再截图徽标所在区域（我的 favicon viewBox 即该区域）
const officialBox = { x: 1, y: 10.6, w: 344.6, h: 373.8 };
const scale = SIZE / officialBox.h; // 让徽标高度铺满 512，与 favicon 的等比缩放一致
await page.setContent(`<body style="margin:0;background:transparent">
  <div style="width:${1493 * scale}px;height:${391 * scale}px">${official.replace('<svg ', `<svg width="100%" height="100%" `)}</div>
</body>`);
await page.screenshot({
  path: path.join(here, 'official-badge.png'),
  omitBackground: true,
  clip: { x: officialBox.x * scale, y: officialBox.y * scale, width: officialBox.w * scale, height: officialBox.h * scale },
});

await page.setContent(`<body style="margin:0;background:transparent">
  <div style="width:${(SIZE * officialBox.w / officialBox.h).toFixed(2)}px;height:${SIZE}px">${ours.replace('<svg ', '<svg width="100%" height="100%" ')}</div>
</body>`);
await page.screenshot({ path: path.join(here, 'our-mark.png'), omitBackground: true, fullPage: true });

await browser.close();
console.log('已渲染 official-badge.png 与 our-mark.png');
