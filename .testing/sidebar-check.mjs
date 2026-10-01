// 侧栏激活态测试：每个页面都必须有「章节高亮 + 唯一 aria-current 当前项」，且点击跳转后继续保持。
import { chromium } from 'playwright';

const BASE = process.env.BASE || 'http://localhost:1515';
const targets = [
  ['顶层章节索引', '/methods/'],
  ['二级子章节索引', '/methods/page/'],
  ['三级叶子页', '/methods/page/section/'],
  ['函数叶子页(二级)', '/functions/strings/chomp/'],
  ['术语条目(三级)', '/quick-reference/glossary/shortcode/'],
  ['普通章节页', '/configuration/markup/'],
];

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 950 } });

const probe = () => page.evaluate(() => {
  const sidebar = document.querySelector('.sidebar');
  const q = (el) => el && ({ text: el.textContent.trim().slice(0, 24), cls: el.className, aria: el.getAttribute('aria-current'), color: getComputedStyle(el).color, weight: getComputedStyle(el).fontWeight, bg: getComputedStyle(el).backgroundColor, borderLeft: getComputedStyle(el).borderLeftColor });
  const currents = Array.from(sidebar.querySelectorAll('a[aria-current="page"]'));
  return {
    展开子列表: sidebar.querySelectorAll('.sidebar-list').length,
    章节高亮: q(sidebar.querySelector('.sidebar-section.is-active')),
    aria_current条目数: currents.length,
    当前项: q(currents[0]),
    当前项在可视区: currents[0] ? (() => { const r = currents[0].getBoundingClientRect(); return r.top > 0 && r.bottom < window.innerHeight; })() : false,
  };
});

let problems = 0;
const rows = [];
for (const [label, path] of targets) {
  await page.goto(BASE + path, { waitUntil: 'load' });
  const info = await probe();
  const ok = !!(info.章节高亮 && info.aria_current条目数 === 1 && info.当前项);
  if (!ok) problems++;
  rows.push(`${ok ? '✓' : '✗'} ${label.padEnd(16)} ${path.padEnd(38)} 章节=${info.章节高亮 ? info.章节高亮.text : '无'}  当前=${info.当前项 ? info.当前项.text : '无'}  aria=${info.aria_current条目数}  展开=${info.展开子列表}` + `  可视=${info.当前项在可视区 ? '是' : '否'}`);
  if (!ok) console.log('  明细:', JSON.stringify(info));
  await page.locator('.sidebar').screenshot({ path: `.testing/shot-${path.replace(/[^a-z0-9]+/gi, '_')}.png` }).catch(() => {});
}

console.log('── 静态渲染检查 ───────────────────────────────────────────');
rows.forEach(r => console.log(' ' + r));

// 点击跳转后是否保持激活（同章节内点下一个兄弟页）
console.log('\n── 点击跳转保持激活 ───────────────────────────────────────');
await page.goto(BASE + '/methods/page/section/', { waitUntil: 'load' });
const before = await probe();
const link = page.locator('.sidebar-list a').nth(3);
const targetText = (await link.textContent()).trim();
await link.click();
await page.waitForLoadState('load');
const after = await probe();
const kept = !!(after.章节高亮 && after.aria_current条目数 === 1);
if (!kept) problems++;
console.log(` ${kept ? '✓' : '✗'} 点击侧栏「${targetText}」→ ${new URL(page.url()).pathname}`);
console.log(`   跳转前当前=${before.当前项?.text}；跳转后当前=${after.当前项?.text}，章节=${after.章节高亮?.text}，展开=${after.展开子列表}`);
await page.locator('.sidebar').screenshot({ path: '.testing/shot-after-click.png' }).catch(() => {});

console.log(`\n合计问题：${problems}`);
await browser.close();
process.exit(problems ? 1 : 0);
