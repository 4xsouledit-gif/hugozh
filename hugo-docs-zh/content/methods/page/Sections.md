+++
title = "Sections"
linkTitle = "Sections"
description = "返回 section 页面集合，给定页面的每一个直属子 section 对应一个页面。"
date = 2026-10-02
weight = 750
source = "https://gohugo.io/methods/page/sections/"

[params.functions_and_methods]
signatures = ["PAGE.Sections"]
returnType = "page.Pages"
+++

## 这一页解决什么问题

要在首页或栏目页里列出「子栏目」，`.Sections` 是最直接的方法：它只返回**直属子 section 的 section 页**，不掺常规页面。做「栏目导航」「文档站左侧的章节列表」时用它；如果写成 `.Pages`，还得自己把常规页面过滤掉。

它和 [`.Pages`](/methods/page/pages/)、[`.RegularPages`](/methods/page/regularpages/) 的分工：

| 方法 | 返回 |
| --- | --- |
| `.Sections` | 只有直属子 section 页 |
| `.Pages` | 当前层常规页面 + 直属子 section 页 |
| `.RegularPages` | 只有当前层常规页面 |

## 什么时候用，什么时候别用

**该用**：

- 首页/栏目页的「栏目列表」「章节导航」；
- 只想遍历子 section（要它们的 `Title`、`RelPermalink`、`.Pages`）。

**别用**：

- 要连常规页面一起列 → 用 [`.Pages`](/methods/page/pages/)；
- 要所有后代 section、更深层也算 → 没有现成方法，需自己递归 `.Sections`；
- 在常规内容页上调用 → 实测返回空集合（只服务 `home`、`section`、`taxonomy`）。

**在已知的 section 页上，`len(.Pages) == len(.RegularPages) + len(.Sections)`**（实测 `/docs/`：`2 = 1 + 1`）——但 taxonomy 页是例外：它的 `.Pages` 是术语页，`.RegularPages` 与 `.Sections` 都是空（实测 `/tags/` 为 `2 = 0 + 0`），所以不要把这个等式当成通用规律。

## 用法

`Page` 对象上的 `Sections` 方法可用于这些[页面类型](g)：`home`、`section` 和 `taxonomy`。这些页面类型的模板会在[上下文](g)中接收一个页面[集合](g)，并按[默认排序顺序](g)排列。

内容结构如下：

```tree
content/
├── auctions/
│   ├── 2023-11/
│   │   ├── _index.md     <-- front matter: weight = 202311
│   │   ├── auction-1.md
│   │   └── auction-2.md
│   ├── 2023-12/
│   │   ├── _index.md     <-- front matter: weight = 202312
│   │   ├── auction-3.md
│   │   └── auction-4.md
│   ├── _index.md         <-- front matter: weight = 30
│   ├── bidding.md
│   └── payment.md
├── books/
│   ├── _index.md         <-- front matter: weight = 20
│   ├── book-1.md
│   └── book-2.md
├── films/
│   ├── _index.md         <-- front matter: weight = 10
│   ├── film-1.md
│   └── film-2.md
└── _index.md
```

模板如下：

```go-html-template
{{ range .Sections.ByWeight }}
  <h2><a href="{{ .RelPermalink }}">{{ .LinkTitle }}</a></h2>
{{ end }}
```

在首页上，Hugo 渲染出：

```html
<h2><a href="/films/">Films</a></h2>
<h2><a href="/books/">Books</a></h2>
<h2><a href="/auctions/">Auctions</a></h2>
```

在 auctions 页面上，Hugo 渲染出：

```html
<h2><a href="/auctions/2023-11/">Auctions in November 2023</a></h2>
<h2><a href="/auctions/2023-12/">Auctions in December 2023</a></h2>
```

## 完整示例：首页栏目导航

测试站结构：顶层有 `/posts/`（无子 section）与 `/docs/`（含子 section `/docs/guide/`）。

首页模板：

```go-html-template {file="layouts/index.html"}
<nav>
  {{ range .Sections.ByWeight }}
    <a href="{{ .RelPermalink }}">{{ .Title }}</a>
  {{ end }}
</nav>
```

实测（Hugo 0.167.0）渲染首页：

```html
<nav>
  <a href="/posts/">文章</a>
  <a href="/docs/">文档</a>
</nav>
```

如果在循环里写 `{{ len .RegularPages }}`，注意 **点号已经变成子 section**，取到的是该子 section 自己的常规页面数——实测首页上依次得到 `/posts` = 10、`/docs` = 1（`/docs` 的直接常规页面只有 `ref.md` 一个，`guide/` 的子页面不算）。

其他页面实测：

| 渲染的页面 | `range .Sections` 得到 |
| --- | --- |
| `/`（首页） | `/posts`、`/docs` |
| `/docs/` | `/docs/guide` |
| `/posts/`（无子 section） | 空 |
| `/docs/guide/`（无子 section） | 空 |
| `/tags/`（taxonomy） | 空 |

**你应当看到什么**：`/docs/` 的 `.Sections` 只有 `/docs/guide`（不含常规页面 `/docs/ref`），而它的 `.RegularPages` 只有 `/docs/ref`。`range` 里点号是子 section 页，所以 `.Title`、`.RelPermalink`、`.RegularPages` 全都属于那个子 section。

## 返回值边界（实测）

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| 首页 | 所有顶层 section 页（实测 2 条） | 否 |
| 有子 section 的 section | 直属子 section 页（实测 `/docs/` → 1 条） | 否 |
| 无子 section 的 section | 空集合（`len` 为 0，`if` 为假） | 否 |
| taxonomy 页 | 实测空集合 | 否 |
| 常规内容页 | 空集合 | 否 |
| 更深层的子 section | **不递归**：只返回直属一层 | 否 |
| 返回类型 | `page.Pages`（可 `.ByWeight`、`.ByTitle`） | 否 |

更多排查入口见[故障排查](/troubleshooting/)。
