+++
title = "FirstSection"
linkTitle = "FirstSection"
description = "返回给定页面所属顶层 section 的 Page 对象。"
date = 2026-10-02
weight = 180
source = "https://gohugo.io/methods/page/firstsection/"

[params.functions_and_methods]
signatures = ["PAGE.FirstSection"]
returnType = "page.Page"
+++

## 这一页解决什么问题

`FirstSection` 返回当前页面所属的**顶层** section。顶栏按栏目高亮、「回到栏目首页」这类需求都靠它；它与 `CurrentSection` 的分工是：`CurrentSection` 给**最内层**，`FirstSection` 给**最外层**。

## 什么时候用，什么时候别用

**该用**：

- 顶栏按栏目高亮（`/docs/guide/alpha/` 的栏目是 `/docs/`）；
- 取顶层 section 的标题与路径，做栏目首页链接。

**别用**：

- 要**最内层** section → 用 [`CurrentSection`](/methods/page/currentsection/)；
- 要**直接父级** → 用 `.Parent`；
- 要整条祖先链 → 用 [`Ancestors`](/methods/page/ancestors/)。

## 用法

[section（内容区块）](/quick-reference/glossary/section/)

> [!NOTE]
> 在首页上调用时，`FirstSection` 方法返回首页自身的 `Page` 对象。

内容结构如下：

```tree
content/
├── auctions/
│   ├── 2023-11/
│   │   ├── _index.md     <-- first section: auctions
│   │   ├── auction-1.md
│   │   └── auction-2.md  <-- first section: auctions
│   ├── 2023-12/
│   │   ├── _index.md
│   │   ├── auction-3.md
│   │   └── auction-4.md
│   ├── _index.md         <-- first section: auctions
│   ├── bidding.md
│   └── payment.md        <-- first section: auctions
├── books/
│   ├── _index.md         <-- first section: books
│   ├── book-1.md
│   └── book-2.md         <-- first section: books
├── films/
│   ├── _index.md         <-- first section: films
│   ├── film-1.md
│   └── film-2.md         <-- first section: films
└── _index.md             <-- first section: home
```

要链接到当前页面所属的顶层 section：

```go-html-template
<a href="{{ .FirstSection.RelPermalink }}">{{ .FirstSection.LinkTitle }}</a>
```

## 完整示例：链接到所属栏目

最小站点：`content/docs/guide/alpha.md`（页面），`content/docs/guide/_index.md` 与 `content/docs/_index.md` 的 `title` 分别是「指南」「文档」。模板放在 `layouts/_default/single.html`：

```go-html-template {file="layouts/_default/single.html"}
<a href="{{ .FirstSection.RelPermalink }}">{{ .FirstSection.LinkTitle }}</a>
```

`hugo --source <站点目录> --ignoreCache` 构建后，`/docs/guide/alpha/` 输出：

```html
<a href="/docs/">文档</a>
```

**你应当看到什么**：页面位于 `/docs/guide/` 之下，但 `FirstSection` 返回的是**顶层**的 `/docs/`；如果换成 `CurrentSection`，同一页面会得到 `/docs/guide/`。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，Windows；结构 `content/docs/guide/alpha.md` 加逐层 `_index.md`。

| 调用位置 | 结果 | 是否报错 |
| --- | --- | --- |
| 页面 `/docs/guide/alpha/` | `/docs`（顶层 section） | 否 |
| section 页 `/docs/guide/` | `/docs` | 否 |
| 顶层 section 页 `/docs/` | 返回它**自己** | 否 |
| 首页 | 返回**首页自己**（上游已说明） | 否 |
| 返回类型 | `page.Page`，不会是 `nil` | 否 |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 没报错但结果不对 | 栏目高亮指向了子目录 | 用了 `CurrentSection` | 栏目级判断用 `FirstSection` |
| 没报错但结果不对 | 首页上取到的不是某个 section | 首页的 `FirstSection` 是首页自己 | 首页单独写导航逻辑 |
| 没报错但结果不对 | 译文页的栏目层级与原文不同 | 译文缺少顶层 `_index.md` | 给顶层 section 补译文 |

更多排查入口见[故障排查](/troubleshooting/)。

