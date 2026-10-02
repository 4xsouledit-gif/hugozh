+++
title = "RegularPages"
linkTitle = "RegularPages"
description = "返回所有常规页面的集合。"
date = 2026-10-02
weight = 200
source = "https://gohugo.io/methods/site/regularpages/"

[params.functions_and_methods]
signatures = ["SITE.RegularPages"]
returnType = "page.Pages"
+++

## 这一页解决什么问题

`RegularPages` 返回当前语言下**所有常规页面**（[regular page](g)，即 `kind` 为 `page` 的那些），按[默认排序](g)排列。它不包含首页、section 页面、分类法页面和术语页面。

一句话：**「文章列表」要的就是它**。上游在 [`Site.Pages`](/methods/site/pages/) 页明确写着「大多数情况下你应该改用 `RegularPages`」。

## 什么时候用，什么时候别用

**该用**：

- 首页、RSS、sitemap 里的内容条目；
- 需要按标题、日期重新排序时（配合 [methods/pages](/methods/pages/) 的排序方法）；
- 需要全部文章的计数。

**别用**：

- 用 [`Site.Pages`](/methods/site/pages/) 列文章 → 会把首页、分类法、术语页面一起列出来；
- 只想列某个 section → 用 `.Site.GetPage "/books"` 后取 `.Pages`，或 `where .Site.RegularPages "Section" "eq" "books"`；
- 只想列栏目 → 用 [`Site.Sections`](/methods/site/sections/)。

## 用法

`Site` 对象上的 `RegularPages` 方法按[默认排序](g)返回所有[常规页面](g)的集合。

```go-html-template
{{ range .Site.RegularPages }}
  <h2><a href="{{ .RelPermalink }}">{{ .LinkTitle }}</a></h2>
{{ end }}
```

[默认排序（default sort order）](/quick-reference/glossary/default-sort-order/)

[default sort order](g)

要改变排序方式，请使用 `Pages` 的任意一个[排序方法][]。例如：

```go-html-template
{{ range .Site.RegularPages.ByTitle }}
  <h2><a href="{{ .RelPermalink }}">{{ .Title }}</a></h2>
{{ end }}
```

## 完整示例（实测）

最小站点：4 本书 + 3 部电影，另有 2 个 section、3 个分类法与 5 个术语页面。home 模板：

```go-html-template {file="layouts/index.html"}
<p>共 {{ len .Site.RegularPages }} 篇</p>
{{ range .Site.RegularPages }}
  <h2><a href="{{ .RelPermalink }}">{{ .LinkTitle }}</a></h2>
{{ end }}
```

Hugo 渲染为（`range` 留下的空行已省略）：

```html
<p>共 7 篇</p>

  <h2><a href="/films/film-3/">Film Three</a></h2>

  <h2><a href="/films/film-2/">Film Two</a></h2>

  <h2><a href="/films/film-1/">Film One</a></h2>

  <h2><a href="/books/pride-and-prejudice/">Pride and Prejudice</a></h2>

  <h2><a href="/books/jamaica-inn/">Jamaica Inn</a></h2>

  <h2><a href="/books/death-on-the-nile/">Death on the Nile</a></h2>

  <h2><a href="/books/and-then-there-were-none/">And Then There Were None</a></h2>
```

改按标题排序（`.ByTitle`，实测输出用 `|` 分隔）：

```text
And Then There Were None|Death on the Nile|Film One|Film Three|Film Two|Jamaica Inn|Pride and Prejudice
```

**你应当看到什么**：同一批内容，默认排序得到的是「区块权重 + 日期」的顺序，`ByTitle` 得到纯字母序，而两者都**只有 7 条**——分类法、术语、首页都不在里面（对照 [`Site.Pages`](/methods/site/pages/) 的 18 条）。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，单语言站点；另用一个只有首页的站点测空集情况，Windows。

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| 有 7 个常规页面的站点 | `len` → 7 | 否 |
| 只有首页、没有常规页面的站点 | 空集合（`len` → 0，`range` 不产生任何输出） | 否 |
| 草稿页面 | 默认不含（需要 `hugo -D` 才会进入集合） | 否 |
| `printf "%T" .Site.RegularPages` | `page.Pages` | 否 |
| `.ByTitle` / `.ByDate` 等 | 返回同样是 `page.Pages`，可直接继续链式调用 | 否 |
| 与 [`Site.Pages`](/methods/site/pages/) 比较 | 同一站点实测 7 条 vs 18 条 | 否 |

[排序方法]: /methods/pages/
