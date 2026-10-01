// 图标多尺寸预览：把 static/favicon.svg 渲染成不同尺寸并排出来，用于检查留白与可辨识度。
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(here, '..');
const svg = fs.readFileSync(path.join(ROOT, 'hugo-docs-zh', 'static', 'favicon.svg'), 'utf8');
const PAD = 0.04;

const sizes = [16, 32, 48, 64, 128, 180, 512];
const cells = sizes.map((s) => {
  const box = Math.round(s * (1 - 2 * PAD));
  return `<div class="cell">
    <div class="canvas" style="width:${s}px;height:${s}px">
      <div style="width:${box}px;height:${box}px;display:flex;align-items:center;justify-content:center">
        ${svg.replace('<svg ', '<svg width="100%" height="100%" preserveAspectRatio="xMidYMid meet" ')}
      </div>
    </div>
    <div class="label">${s}px</div>
  </div>`;
}).join('');

const html = `<!doctype html><meta charset="utf-8"><style>
  body { margin:0; padding:24px; background:#fff; font-family:"Microsoft YaHei",sans-serif; }
  .row { display:flex; align-items:flex-end; gap:28px; }
  .cell { display:flex; flex-direction:column; align-items:center; gap:8px; }
  .canvas { display:flex; align-items:center; justify-content:center; outline:1px dashed #d7dbe0; }
  .label { font-size:12px; color:#5a606a; }
  .box { margin-top:20px; font-size:13px; color:#5a606a; }
</style>
<div class="row">${cells}</div>
<div class="box">虚线 = 图标画布边界；留白比例 PAD=${PAD}（画布每边 ${Math.round(PAD * 100)}%）。徽标宽高比 ≈ 0.92，
俯视可见左右空隙略大于上下——方形容器内等比不变形时二者无法同时相等。</div>`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1100, height: 420 }, deviceScaleFactor: 2 });
await page.setContent(html, { waitUntil: 'load' });
await page.screenshot({ path: path.join(here, 'icon-preview.png'), fullPage: true });
await browser.close();
console.log('已输出 icon-preview.png');
