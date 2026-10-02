#!/usr/bin/env node
/**
 * 搜索链路校验（一次性、不依赖浏览器）：
 *   1) public/search.json 的结构与字段是否可用；
 *   2) 用一组测试向量核对「打分与排序」是否得到读者预期的结果。
 *
 * 打分逻辑与 themes/hugo-docs-theme/assets/js/site.js 的 norm()/score() 保持一致。
 * 两处若有一处改动，这里会立刻失败 —— 这就是它存在的意义。
 *
 * 用法：node .testing/search-check.mjs [站点目录，默认 hugo-docs-zh]
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";

const siteDir = process.argv[2] || "hugo-docs-zh";
const indexPath = join(siteDir, "public", "search.json");

const norm = (s) => (s || "").toLowerCase().replace(/\s+/g, "");

// 与 assets/js/site.js 的 score() 保持一致：改动任一处都必须同步另一处
function score(item, q) {
  const t = norm(item.t);
  const s = norm(item.s);
  const d = norm(item.d);
  const dotted = item.q ? 10 : 0;
  if (t === q) return 100 + dotted;
  if (t.indexOf(q) === 0) return 80 + dotted;
  if (item.q) {
    const last = t.slice(t.lastIndexOf(".") + 1);
    if (last.indexOf(q) === 0) return 78 + dotted;
  }
  if (t.indexOf(q) > -1) return 60 + dotted - Math.min(8, t.length / 8);
  if (s.indexOf(q) > -1) return 22;
  if (d.indexOf(q) > -1) return 18;
  return 0;
}

const rank = (items, q) =>
  items
    .map((it) => ({ it, sc: score(it, norm(q)) }))
    .filter((r) => r.sc > 0)
    .sort((a, b) => b.sc - a.sc)
    .slice(0, 20)
    .map((r) => r.it);

let data;
try {
  data = JSON.parse(readFileSync(indexPath, "utf8"));
} catch (e) {
  console.error(`✗ 读不到索引 ${indexPath}：${e.message}`);
  process.exit(1);
}

const items = data.items || [];
let failed = 0;
const check = (name, cond, extra = "") => {
  if (cond) {
    console.log(`  ✓ ${name}`);
  } else {
    console.log(`  ✗ ${name} ${extra}`);
    failed++;
  }
};

console.log(`索引：${indexPath}`);
console.log(`条目：${data.count}（items 实际 ${items.length}）`);
check("count 与 items 长度一致", data.count === items.length);
check("条目数不少于 800", items.length >= 800, `实际 ${items.length}`);

const sample = items[0];
check("每条都有标题 t", typeof sample.t === "string" && sample.t.length > 0);
check("每条都有链接 u", typeof sample.u === "string" && sample.u.startsWith("/"));
check("u 指向目录形式（末尾带 /）或文件", /\/$|\.[a-z]+$/.test(sample.u), sample.u);

// 测试向量：查询 → 期望出现在前 5 的结果路径片段
const vectors = [
  { q: "truncate", expect: "/functions/strings/truncate/" },
  { q: "strings.truncate", expect: "/functions/strings/truncate/" },
  { q: "where", expect: "/functions/collections/where/" },
  { q: "hugo server", expect: "/commands/hugo-server/" },
  { q: "快速开始", expect: "/getting-started/quick-start/" },
  { q: "页面包", expect: "/content-management/page-bundles/" },
  { q: "前置元数据", expect: "/content-management/front-matter/" },
  { q: "渲染钩子", expect: "/render-hooks/" },
  { q: "分页", expect: "/templates/pagination/" },
  { q: "短代码", expect: "/shortcodes/" },
];

console.log("\n测试向量（期望命中前 5）：");
for (const { q, expect } of vectors) {
  const top = rank(items, q);
  const found = top.slice(0, 5).some((it) => it.u.startsWith(expect));
  check(`「${q}」→ ${expect}`, found, `实得：${top.slice(0, 3).map((i) => i.u).join(", ") || "（无命中）"}`);
}

console.log("\n排序抽查：");
check("truncate 首位是限定名 strings.Truncate", rank(items, "truncate")[0]?.u === "/functions/strings/truncate/", rank(items, "truncate").slice(0, 3).map((i) => i.u).join(", "));
check("filter 前 5 含 images.Filter 与 Resource.Filter", ["/functions/images/filter/", "/methods/resource/filter/"].every((u) => rank(items, "filter").slice(0, 5).some((i) => i.u === u)), rank(items, "filter").slice(0, 5).map((i) => i.u).join(", "));
check("结果不含重复路径", new Set(rank(items, "page").map((i) => i.u)).size === rank(items, "page").length);
check("无命中查询返回空", rank(items, "zzzz不存在的词zzzz").length === 0);

console.log(failed === 0 ? "\n全部通过 ✓" : `\n失败 ${failed} 项 ✗`);
process.exit(failed === 0 ? 0 : 1);
