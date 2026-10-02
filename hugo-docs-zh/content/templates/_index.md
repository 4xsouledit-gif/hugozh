+++
title = "模板"
linkTitle = "模板"
description = "用模板把内容、资源与数据渲染为发布页面：本章给出完整学习路径，每页都带最小可运行示例与可检验的验证方法。"
date = 2026-10-01
weight = 70
source = "https://gohugo.io/templates/"

[params.teach]
difficulty = "进阶"
time = "3–5 小时（含动手验证）"
prereq = [
  "站点已经能在本地跑起来：完成[快速开始](/getting-started/quick-start/)，知道 `hugo` 与 `hugo server` 的区别。",
  "大致了解[目录结构](/getting-started/directory-structure/)，尤其清楚 `layouts/` 与 `content/` 的对应关系。",
  "读得懂 TOML 前置元数据（front matter）和基本 HTML；不需要会 Go。",
]
outcomes = [
  "判断某个 URL 由 `layouts/` 下的哪个文件渲染，找不到模板时知道去哪里查；",
  "从零写出首页、单页、列表页等各类模板，并知道谁是谁的回退模板；",
  "为站点补上 404 页面、`robots.txt`、`sitemap.xml` 与 RSS 订阅源，并说清它们生成在哪个路径；",
  "在模板里遍历菜单、分页列表，并写出一个能被内容页调用的短代码（shortcode）；",
  "改完模板后用构建产物（`public/` 或 `hugo --renderToMemory` 的输出）验证效果，而不是靠刷新浏览器猜。",
]
next = ["/render-hooks/", "/functions/", "/methods/"]

+++

## 本章导读

模板（template）决定内容、资源与数据最终以什么样子发布。Hugo 使用 Go 标准库的 `text/template` 与 `html/template` 包，渲染 HTML 时默认用后者，输出天然对代码注入做了防护；你也可以为 CSV、JSON、RSS、纯文本等输出格式编写模板。

模板由**上下文**（context）、动作、变量、函数与方法组成。其中上下文最关键：传入模板的数据就是上下文，在模板里用点（`.`）表示。页面模板收到的是 `Page` 对象，通过它的方法取得标题、日期与自定义参数。新手最常见的模板错误大多与上下文有关，建议先弄清这个概念。

## 读完本章你应该能够

- 说出一个 URL 是由 `layouts/` 下**哪个文件**渲染的，并在页面「没有样式」「内容不对」时按[模板查找顺序](/templates/lookup-order/)定位到具体文件；
- 从零写出 `home`、`page`、`section`、`taxonomy`、`term` 五类页面模板，并知道 `single`、`list`、`all` 分别是哪些模板的回退（见[内容类型](/templates/types/)）；
- 为站点补上 404 页面、`robots.txt`、`sitemap.xml` 与 RSS 订阅源，并说清它们各自生成在哪个路径；
- 在模板里遍历菜单与分页列表，并写一个能被内容页调用的短代码（shortcode）；
- 改完模板后用构建产物验证效果：终端里没有 `ERROR`，`public/` 下出现了预期的文件。

## 阅读顺序

本章的侧栏顺序就是建议的阅读顺序，分三段：

**第一段：站点级输出文件（先拿到手就能用的四页）**

1. [404 页面](/templates/404/)——位置最特殊的一个模板，顺便弄清「Hugo 生成」与「服务器使用」的分工。
2. [robots.txt](/templates/robots/)——用模板生成抓取规则，并验证它出现在 `public/robots.txt`。
3. [站点地图](/templates/sitemap/)——`sitemap.xml` 的生成、配置与屏蔽单页。
4. [RSS 订阅](/templates/rss/)——控制订阅源的生成范围与条数。

**第二段：模板语法与查找规则（本章的地基）**

5. [简介](/templates/introduction/)——上下文、动作、变量、函数与方法。**这一页是后面所有页面的前提，时间紧就先读它。**
6. [内容类型](/templates/types/)——每个模板文件各管什么、如何回退，是本章的总览。
7. [模板查找顺序](/templates/lookup-order/)——Hugo 挑模板的规则；页面渲染结果不对时来这里对照。
8. [新版模板系统概览](/templates/new-templatesystem-overview/)——v0.146.0 之后的目录约定与旧项目迁移。

**第三段：组件与复用**

9. [菜单模板](/templates/menu/)——遍历 `site.Menus`，渲染平铺或嵌套导航。
10. [分页](/templates/pagination/)——把长列表拆成多个 pager 并生成页码导航。
11. [内建模板](/templates/embedded/)——评论、统计、社交卡片、分页导航等可直接调用的现成模板。
12. [局部模板装饰器](/templates/partial-decorators/)——写出「包裹式」组件，让局部模板包住内容。
13. [短代码模板](/templates/shortcode/)——把模板能力带进内容写作，供作者在 Markdown 里调用。

刚开始接触 Hugo 的话，建议先完成[快速开始](/getting-started/quick-start/)，对目录结构与构建流程有个整体印象，再回到本章。内容写作中常见的短代码调用语法，参见[短代码](/shortcodes/)。

## 每页的固定结构

本章每页都按同一套结构写，方便你跳读：

1. **「这段在解决什么问题」**——先讲清页面存在的理由，再进入细节；
2. **最小可运行示例**——能直接复制进项目、跑得起来的完整片段；
3. **「结果长什么样」**——给出预期输出（终端文本或生成的 HTML/文件结构），这是判断自己做对了没有的依据；
4. **常见坑**——按「命令找不到 / 没报错但结果不对 / 报错看不懂」三类归纳，并指向[故障排查](/troubleshooting/)。

## 最少要掌握的验证循环

模板改动的效果**只在构建产物里**，所以这一章反复用到下面三条命令：

```bash
hugo --renderToMemory   # 只渲染、不写 public/：最快验证语法与模板有没有报错
hugo                    # 真正构建，产物写到 public/，用编辑器打开核对
hugo server             # 本地预览，改文件自动刷新浏览器
```

`hugo --renderToMemory` 你应当看到：最后几行是一张统计表，形如

```text
                  │ ZH - CN 
──────────────────┼─────────
 Pages            │    1965 
 Static files     │      20 
 Total in 1268 ms
```

`Pages` 是渲染出的页面数量。**没有 `ERROR` 行、`Total in` 一行出现，就说明这次渲染成功了**——这与「页面好不好看」是两件事，视觉效果要去 `public/` 或浏览器里看。

## 卡住了怎么办

| 现象 | 先查这里 |
| --- | --- |
| `ERROR failed to extract shortcode` | 短代码没找到，或正文里写了未转义的短代码定界符 → [故障排查](/troubleshooting/) |
| 构建出现 `found no layout file for …` 警告 | 模板文件名/目录不符合查找规则；这是 WARNING，构建会继续，但该页面没有内容输出 → [模板查找顺序](/templates/lookup-order/) |
| 构建成功，但页面上该有的内容没有 | 模板没被选中，或上下文用错 → 本页「验证循环」+ [简介](/templates/introduction/) |
| 页面能打开但没有样式 | 多半是资源或基础模板问题，不是本章内容 → [Hugo Pipes](/hugo-pipes/) |
| 报错指向一个你已经改好的文件 | 可能是别处的语法错误被归因到了这里 → 用 `hugo --ignoreCache` 复现一次 |

提问时请附上 `hugo version` 的输出、完整报错，以及相关模板文件的路径与内容——模板问题几乎都能靠这三样定位。
