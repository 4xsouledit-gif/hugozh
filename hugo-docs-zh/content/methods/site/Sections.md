+++
title = "Sections"
linkTitle = "Sections"
description = "返回顶层 section 页面的集合。"
date = 2026-10-02
weight = 220
source = "https://gohugo.io/methods/site/sections/"

[params.functions_and_methods]
signatures = ["SITE.Sections"]
returnType = "page.Pages"
+++

## 这一页解决什么问题

`Sections` 返回**顶层 section 的页面对象集合**——是页面，不是名字。因此每一项都能直接给 `.Title`、`.RelPermalink`、`.Pages`、`.Params`，适合渲染栏目导航。

它和 [`MainSections`](/methods/site/mainsections/) 只差一字，但返回的东西完全不同：`Sections` 是页面集合（全部顶层栏目），`MainSections` 是**字符串切片**（配置指定的「主栏目」，没配就取页面最多的一个）。

## 什么时候用，什么时候别用

**该用**：

- 栏目导航 / 站点地图的顶层节点；
- 想显示每个栏目下有多少页（`len .Pages`）。

**别用**：

- 只要栏目**名字**（例如交给 `where … "in"`）→ 用 [`MainSections`](/methods/site/mainsections/) 或 `range` 后取 `.Section`；
- 想列**子 section** → 在 section 页面上用 `.Sections` / `.Pages`（见 [methods/page](/methods/page/)），本站方法只给顶层；
- 想要所有页面 → 用 [`Site.RegularPages`](/methods/site/regularpages/) 或 [`Site.Pages`](/methods/site/pages/)。

## 用法

`Site` 对象上的 `Sections` 方法按[默认排序](g)返回顶层 [section 页面](g)的集合。

给定如下内容结构：

```tree
content/
├── books/
│   ├── book-1.md
│   └── book-2.md
├── films/
│   ├── film-1.md
│   └── film-2.md
└── _index.md
```

这个模板：

```go-html-template
{{ range .Site.Sections }}
  <h2><a href="{{ .RelPermalink }}">{{ .LinkTitle }}</a></h2>
{{ end }}
```

渲染结果为：

```html
<h2><a href="/books/">Books</a></h2>
<h2><a href="/films/">Films</a></h2>
```

## 完整示例（实测）

`content/books/`（4 页，`weight = 10`）与 `content/films/`（3 页，`weight = 20`）两个 section。home 模板：

```go-html-template {file="layouts/index.html"}
<p>共 {{ len .Site.Sections }} 个顶层 section</p>
{{ range .Site.Sections }}
  <h2><a href="{{ .RelPermalink }}">{{ .LinkTitle }}</a>（{{ len .Pages }} 页）</h2>
{{ end }}
```

Hugo 渲染为：

```html
<p>共 2 个顶层 section</p>

  <h2><a href="/books/">Books</a>（4 页）</h2>

  <h2><a href="/films/">Films</a>（3 页）</h2>
```

**你应当看到什么**：顺序是 `Books` → `Films`（各自的 `weight` 为 10、20），且 `len .Pages` 数的是该 section 直接管辖的内容。把内容拆成 `content/films/shorts/` 这样的子目录后，顶层 `Sections` 仍然只列 `Books`、`Films`；子 section 要在该 section 页面上用 `.Sections` 取（实测 `/films` 的 `.Sections` → `Shorts=1`，而 `/films` 自己的 `.Pages` 为 2：1 个页面 + 1 个子 section 页）。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，单语言站点，`books` 4 页、`films` 3 页，Windows。

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| 有两个顶层 section | `len` → 2，可 `range`，每项是完整页面对象 | 否 |
| 站点只有首页（无 section） | 空集合（`len` → 0，`range` 无输出） | 否 |
| 嵌套目录（`films/shorts/`） | 只列顶层 `films`；子 section 需在该页面上取 `.Sections` | 否 |
| 排序 | 按[默认排序](g)（实测按 `weight` 升序：Books、Films） | 否 |
| `printf "%T" .Site.Sections` | `page.Pages` | 否 |
| 取某个 section 的名字 | 用 `.Title` / `.Section`（`Sections` 返回对象，不是字符串） | 否 |
