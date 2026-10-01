// 生成站点图标与社交分享图。
// 徽标直接用 static/favicon.svg（从 Hugo 官方 logo 提取的粉色六边形 + 白 H），
// 由 Chromium 渲染成 PNG，保证与 SVG 完全一致（Pillow 无法渲染 SVG 的圆弧路径）。
// 用法：在仓库根目录执行  node .translation/gen-brand-assets.mjs
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(here, '..');
const SITE = path.join(ROOT, 'hugo-docs-zh');
const STATIC = path.join(SITE, 'static');
const IMAGES = path.join(STATIC, 'images');
fs.mkdirSync(IMAGES, { recursive: true });

const svg = fs.readFileSync(path.join(STATIC, 'favicon.svg'), 'utf8');

const browser = await chromium.launch();

// ---- 1) 图标：统一留白（画布四边同一比例），徽标等比居中 ----
// 注意几何约束：徽标宽高比 ≈ 0.92（偏高），在方形画布中「四边留白完全相等」不可能同时成立，
// 除非拉伸变形。这里采用统一规则：先按 PAD 划出正方形内容盒，再把徽标等比放入并居中；
// 因为徽标偏高，实际左右空隙会略大于上下空隙（这是等比不变形的必然结果）。
const PAD = 0.04; // 画布四边留白比例（改这一个值即可整体调整；0.04 = 每边 4%）

async function renderIcon(size, file, background) {
  const box = Math.round(size * (1 - 2 * PAD));
  const page = await browser.newPage({ viewport: { width: size, height: size }, deviceScaleFactor: 1 });
  await page.setContent(`<body style="margin:0;width:${size}px;height:${size}px;display:flex;align-items:center;justify-content:center;background:${background || 'transparent'}">
    <div style="width:${box}px;height:${box}px;display:flex;align-items:center;justify-content:center">${svg.replace('<svg ', '<svg width="100%" height="100%" preserveAspectRatio="xMidYMid meet" ')}</div>
  </body>`);
  await page.screenshot({ path: file, omitBackground: !background });
  await page.close();
}

await renderIcon(180, path.join(STATIC, 'apple-touch-icon.png'));          // Apple 触摸图标
await renderIcon(64, path.join(IMAGES, 'icon-64.png'));                     // PNG 回退
await renderIcon(512, path.join(IMAGES, 'icon-512.png'));                   // PWA / 高清

// ---- 2) 社交分享图 1200×630 ----
const CJK = '"Microsoft YaHei","PingFang SC","Noto Sans CJK SC",sans-serif';
const og = `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body { width:1200px; height:630px; background:#fff; font-family:${CJK}; color:#14161a;
         display:flex; flex-direction:column; border-top:10px solid #ff4088; }
  .head { display:flex; align-items:center; gap:28px; padding:74px 86px 0; }
  .badge { width:132px; height:143px; flex:0 0 auto; }
  .name { font-size:64px; font-weight:700; letter-spacing:1px; line-height:1.1; }
  .domain { font-size:32px; color:#ff4088; margin-top:6px; }
  .body { padding:44px 86px 0; }
  .lead { font-size:44px; font-weight:700; }
  .meta { margin-top:26px; font-size:28px; color:#5a606a; line-height:1.7; }
  .rule { height:1px; background:#e4e8ec; margin:38px 86px 0; }
  .note { padding:26px 86px 0; font-size:26px; color:#5a606a; }
</style></head><body>
  <div class="head">
    <div class="badge">${svg.replace('<svg ', '<svg width="100%" height="100%" ')}</div>
    <div><div class="name">Hugo 中文文档</div><div class="domain">hugozh.cn</div></div>
  </div>
  <div class="body">
    <div class="lead">Hugo 官方文档简体中文翻译</div>
    <div class="meta">19 个一级章节 · 948 个文件 · 函数与方法参考、术语表全覆盖<br>附英文原文链接，便于对照核实</div>
  </div>
  <div class="rule"></div>
  <div class="note">社区维护 · 非官方翻译 · 以官方英文原文为准</div>
</body></html>`;

const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
await page.setContent(og, { waitUntil: 'load' });
await page.screenshot({ path: path.join(IMAGES, 'og-image.png') });
await page.close();

await browser.close();
console.log('已生成：static/apple-touch-icon.png、static/images/{icon-64,icon-512,og-image}.png');
