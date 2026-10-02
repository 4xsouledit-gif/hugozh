+++
title = "CurrentSection"
linkTitle = "CurrentSection"
description = "返回给定页面所在 section 的 Page 对象。"
date = 2026-10-02
weight = 100
source = "https://gohugo.io/methods/page/currentsection/"

[params.functions_and_methods]
signatures = ["PAGE.CurrentSection"]
returnType = "page.Page"
+++

## 这一页解决什么问题

渲染侧边栏、面包屑、给导航分组时都要回答「当前页属于哪个 section」。`CurrentSection` 返回**最内层**的那个 section 页；对 section 页自身、首页、分类法页与术语页，它返回页面自己。

## 什么时候用，什么时候别用

**该用**：

- 侧边栏只展开当前 section；
- 取当前 section 的标题与链接，做面包屑或「返回上级」；
- 以该 section 为起点取它的页面列表（`.CurrentSection.RegularPages` 等）。

**别用**：

- 要**最外层** section → 用 [`FirstSection`](/methods/page/firstsection/)；
- 要**直接父级**（可能是 section，也可能是普通页面的父容器）→ 用 `.Parent`；
- 要整条祖先链 → 用 [`Ancestors`](/methods/page/ancestors/)；
- 想判断「当前页是不是属于某个 section」（布尔）→ 用 [`InSection`](/methods/page/insection/)，注意它要传 Page 参数。

## 用法

[section（内容区块）](/quick-reference/glossary/section/)

> [!NOTE]
> [section 页](g)、[分类法页](g)、[术语页](g)或首页的当前 section 就是它自身。

内容结构如下：

```tree
content/
├── auctions/
│   ├── 2023-11/
│   │   ├── _index.md     <-- current section: 2023-11
│   │   ├── auction-1.md
│   │   └── auction-2.md  <-- current section: 2023-11
│   ├── 2023-12/
│   │   ├── _index.md
│   │   ├── auction-3.md
│   │   └── auction-4.md
│   ├── _index.md         <-- current section: auctions
│   ├── bidding.md
│   └── payment.md        <-- current section: auctions
├── books/
│   ├── _index.md         <-- current section: books
│   ├── book-1.md
│   └── book-2.md         <-- current section: books
├── films/
│   ├── _index.md         <-- current section: films
│   ├── film-1.md
│   └── film-2.md         <-- current section: films
└── _index.md             <-- current section: home
```

要创建指向当前 section 页面的链接：

```go-html-template
<a href="{{ .CurrentSection.RelPermalink }}">{{ .CurrentSection.LinkTitle }}</a>
```

## 完整示例：链接到当前 section

最小站点：`content/docs/guide/alpha.md`（页面），以及逐层的 `content/docs/guide/_index.md`、`content/docs/_index.md`。模板放在 `layouts/_default/single.html`：

```go-html-template {file="layouts/_default/single.html"}
<a href="{{ .CurrentSection.RelPermalink }}">{{ .CurrentSection.LinkTitle }}</a>
```

`hugo --source <站点目录> --ignoreCache` 构建后，`/docs/guide/alpha/` 输出：

```html
<a href="/docs/guide/">指南</a>
```

**你应当看到什么**：拿到的是**最内层** section（`/docs/guide/`），而不是 `/docs/`。同一个路径如果译文里没有对应的 `_index.md`，译文页会「跳级」：实测中文版 alpha 的 `.CurrentSection` 是 `/docs`，因为它的 `docs/guide` 这一层没有译文 section 页。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，Windows；结构 `content/docs/guide/alpha.md` 加逐层 `_index.md`，另有 en/zh 双语言对照。

| 调用位置 | 结果 | 是否报错 |
| --- | --- | --- |
| 页面 `/docs/guide/alpha/` | `/docs/guide`（最内层 section） | 否 |
| section 页 `/docs/guide/` | 返回它**自己** | 否 |
| 首页 | 返回首页自己 | 否 |
| 分类法页 / 术语页 | 返回页面自己（实测术语页 `/tags/hugo/` 得到 `/tags/hugo`） | 否 |
| 译文缺少中间层 `_index.md` | 返回当前语言中**仍存在**的最近一层 section（实测为 `/docs`） | 否 |
| 返回类型 | `page.Page`，**不会是 nil**，可直接取 `.RelPermalink` / `.LinkTitle` | 否 |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 没报错但结果不对 | 侧边栏展开到顶层 section | `CurrentSection` 只给最内层 | 顶层用 `FirstSection`，整条链用 `Ancestors` |
| 没报错但结果不对 | 把 `.CurrentSection` 当成当前页面 | 它返回的是 section 页 | 当前页面直接用 `.` |
| 没报错但结果不对 | 译文页的侧边栏层级与原文不同 | 译文缺少中间层 `_index.md` | 给中间层补译文，或按 `.CurrentSection.Kind` 判断后兜底 |

更多排查入口见[故障排查](/troubleshooting/)。
