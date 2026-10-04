// 本轮 UI 改动的端到端检查：搜索、主题切换、移动端抽屉、复制、锚点、进度、下拉、落地页。
// 断言的是「读者能不能用」，不是「DOM 里有没有这个类」。
// 用法：先起本地服务（hugo server --port 1515），再 node .testing/ui-check.mjs
import { chromium } from "playwright";

const BASE = process.env.BASE || "http://localhost:1515";
let problems = 0;
const shot = (page, name) => page.screenshot({ path: `.testing/ui-${name}.png` }).catch(() => {});
const check = (label, ok, extra = "") => {
  console.log(`${ok ? "✓" : "✗"} ${label}${ok ? "" : "  " + extra}`);
  if (!ok) problems++;
};

const browser = await chromium.launch();

/* ---------- 桌面 ---------- */
const page = await browser.newPage({ viewport: { width: 1440, height: 950 } });
const errors = [];
page.on("pageerror", (e) => errors.push(String(e)));
page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });

console.log("── 落地页 ─────────────────────────────────────────");
await page.goto(BASE + "/", { waitUntil: "load" });
check("任务卡渲染出 8 张", (await page.locator(".task-card").count()) === 8);
check("章节总览列出 21 章", (await page.locator(".chapter-grid a").count()) === 21);
check("常用入口胶囊存在", (await page.locator(".quick-links a").count()) >= 8);
const heroNum = await page.locator(".hero-stats strong").first().innerText();
check("hero 页数不是 0 或双倍数", /^\d+$/.test(heroNum) && +heroNum > 800 && +heroNum < 1000, `实际 ${heroNum}`);
await shot(page, "home-desktop");

console.log("\n── 搜索 ───────────────────────────────────────────");
// 首次打开才拉索引，故先确认加载前没有请求
await page.keyboard.press("Control+k");
await page.waitForSelector("#search-panel[open]");
check("Ctrl+K 打开搜索面板", true);
await page.fill("#search-panel input[type=search]", "truncate");
await page.waitForSelector(".search-results a", { timeout: 5000 });
const firstResult = await page.locator(".search-results a").first().getAttribute("href");
check("搜索 truncate 首位是 strings.Truncate", firstResult === "/functions/strings/truncate/", `实际 ${firstResult}`);
const resultCount = await page.locator(".search-results a").count();
check("结果数量在 1–20 之间", resultCount > 0 && resultCount <= 20, `实际 ${resultCount}`);
await shot(page, "search-panel");

// 键盘上下 + Enter 跳转
await page.keyboard.press("ArrowDown");
const activeHref = await page.locator(".search-results a.is-active").getAttribute("href").catch(() => null);
check("↑↓ 能选中结果", !!activeHref, String(activeHref));
await page.keyboard.press("Escape");
check("Esc 关闭面板", (await page.locator("#search-panel[open]").count()) === 0);

// 中文查询（注意：输入有 90ms 防抖，必须等到结果真的换成新查询的那一条）
await page.keyboard.press("/");
await page.waitForSelector("#search-panel[open]");
await page.fill("#search-panel input[type=search]", "前置元数据");
await page.waitForFunction(
  () => document.querySelector(".search-results a")?.getAttribute("href") === "/content-management/front-matter/",
  null,
  { timeout: 5000 },
).catch(() => {});
const zhHref = await page.locator(".search-results a").first().getAttribute("href");
check("中文查询可用", zhHref === "/content-management/front-matter/", `实际 ${zhHref}`);
await page.keyboard.press("Escape");

console.log("\n── 主题切换 ───────────────────────────────────────");
const themeBefore = await page.evaluate(() => document.documentElement.getAttribute("data-theme"));
await page.click("[data-theme-toggle]");
const themeAfter = await page.evaluate(() => document.documentElement.getAttribute("data-theme"));
check("点击后 data-theme 切换", !!themeAfter && themeAfter !== themeBefore, `${themeBefore} → ${themeAfter}`);
const stored = await page.evaluate(() => localStorage.getItem("theme"));
check("选择写入 localStorage", stored === themeAfter, String(stored));
// 刷新后仍然生效（防闪烁脚本先于样式执行）
await page.reload({ waitUntil: "load" });
const themeReload = await page.evaluate(() => document.documentElement.getAttribute("data-theme"));
check("刷新后主题保持", themeReload === themeAfter, String(themeReload));
const bg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
const dark = await page.evaluate(() => document.documentElement.getAttribute("data-theme") === "dark");
check(`正文背景与主题一致（${bg}）`, dark ? bg !== "rgb(255, 255, 255)" : bg === "rgb(255, 255, 255)");
await shot(page, "home-dark");

console.log("\n── 章节下拉 ───────────────────────────────────────");
await page.click(".nav-dropdown > summary");
await page.waitForSelector(".nav-dropdown[open] .nav-dropdown-panel");
const dropLinks = await page.locator(".nav-dropdown-panel a").count();
check("下拉列出全部章节", dropLinks === 21, `实际 ${dropLinks}`);
await page.click("body", { position: { x: 5, y: 400 } });
check("点外部可收起", (await page.locator(".nav-dropdown[open]").count()) === 0);

console.log("\n── 内容页增强 ─────────────────────────────────────");
await page.goto(BASE + "/getting-started/quick-start/", { waitUntil: "load" });
check("面包屑存在且有层级", (await page.locator(".breadcrumbs li").count()) >= 2);
const anchors = await page.locator(".heading-anchor").count();
check("标题锚点已注入", anchors > 5, `实际 ${anchors}`);
const copies = await page.locator(".copy-code").count();
check("代码块复制按钮已注入", copies > 5, `实际 ${copies}`);
// 复制真的能用
await page.context().grantPermissions(["clipboard-read", "clipboard-write"]).catch(() => {});
await page.locator(".copy-code").first().click();
await page.waitForTimeout(200);
const btnText = await page.locator(".copy-code").first().innerText();
check("点击复制后给出反馈", /已复制/.test(btnText), btnText);
// 阅读进度
await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2));
await page.waitForTimeout(300);
const width = await page.evaluate(() => document.querySelector(".read-progress").style.width);
check("阅读进度随滚动变化", /%$/.test(width) && parseFloat(width) > 0, width);
// 返回顶部
check("滚动后出现返回顶部", await page.locator("[data-to-top]").isVisible());
await shot(page, "content-desktop");
await page.goto(BASE + "/methods/page/summary/", { waitUntil: "load" });
check("参考页也注入锚点与复制", (await page.locator(".heading-anchor").count()) > 3);

console.log("\n── 移动端（390×844）───────────────────────────────");
const mob = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
await mob.goto(BASE + "/", { waitUntil: "load" });
check("窄屏隐藏桌面导航", !(await mob.locator(".site-nav").isVisible()));
check("窄屏显示汉堡按钮", await mob.locator("[data-drawer-open]").isVisible());
check("窄屏顶栏不横向溢出", await mob.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1),
  await mob.evaluate(() => `${document.documentElement.scrollWidth} > ${window.innerWidth}`));
await mob.click("[data-drawer-open]");
await mob.waitForTimeout(300);
check("抽屉可打开", await mob.locator(".sidebar").isVisible());
const drawerBox = await mob.locator(".sidebar").boundingBox();
check("抽屉在视口内", drawerBox && drawerBox.x >= -1 && drawerBox.width <= 390, JSON.stringify(drawerBox));
await shot(mob, "home-mobile-drawer");
await mob.click("[data-drawer-close]");
await mob.waitForTimeout(300);
check("抽屉可关闭", !(await mob.evaluate(() => document.body.classList.contains("drawer-open"))));
await mob.click("[data-search-open]");
await mob.waitForTimeout(200);
check("移动端能开搜索", (await mob.locator("#search-panel[open]").count()) === 1);
const dialogBox = await mob.locator(".search-dialog").boundingBox();
check("搜索框不超出视口", dialogBox && dialogBox.width <= 390, JSON.stringify(dialogBox));
await shot(mob, "search-mobile");
// 长内容页在窄屏也不溢出
await mob.goto(BASE + "/functions/strings/truncate/", { waitUntil: "load" });
check("内容页窄屏不横向溢出", await mob.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1),
  await mob.evaluate(() => `${document.documentElement.scrollWidth} > ${window.innerWidth}`));
await shot(mob, "content-mobile");

console.log("\n── 控制台错误 ─────────────────────────────────────");
check("桌面端无 JS 报错", errors.length === 0, errors.slice(0, 3).join(" | "));

await browser.close();
console.log(problems === 0 ? "\n全部通过 ✓" : `\n失败 ${problems} 项 ✗`);
process.exit(problems === 0 ? 0 : 1);
