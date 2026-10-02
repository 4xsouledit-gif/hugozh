+++
title = "Pages"
linkTitle = "Pages"
description = "返回所有页面的集合。"
date = 2026-10-02
weight = 170
source = "https://gohugo.io/methods/site/pages/"

[params.functions_and_methods]
signatures = ["SITE.Pages"]
returnType = "page.Pages"
+++

## 这一页解决什么问题

`Site.Pages` 是**当前语言下所有页面的全集**，不分种类：首页、section 页面、分类法页面、术语页面、常规页面都在里面。

正因为「全」，它适合做统计与站点地图这类需要看全貌的事；也正因为「杂」，直接拿它当文章列表会混进首页和分类法页面。

## 什么时候用，什么时候别用

**该用**：

- 需要跨种类的完整清单：站点地图、每类页面计数、按 `Kind` 分组；
- 排查「某个页面到底有没有被 Hugo 收录」。

**别用**：

- 列文章/文章列表 → 用 [`Site.RegularPages`](/methods/site/regularpages/)（上游原话：大多数情况下你应该改用 `RegularPages`）；
- 列栏目 → 用 [`Site.Sections`](/methods/site/sections/)；
- 按分类法取内容 → 用 [`Site.Taxonomies`](/methods/site/taxonomies/)。

## 用法

这个方法按[默认排序](g)返回当前语言中所有页面 [kind](g)，其中包括首页、section 页面、分类法页面、术语页面和常规页面。

大多数情况下你应该改用 [`RegularPages`][] 方法。

```go-html-template
{{ range .Site.Pages }}
  <h2><a href="{{ .RelPermalink }}">{{ .LinkTitle }}</a></h2>
{{ end }}
```

## 完整示例（实测）

最小站点：1 个首页、2 个 section（`books` 4 页、`films` 3 页）、3 个分类法页面（`authors`、`genres`、`tags`）、5 个术语页面（authors 3 个 + genres 2 个，`tags` 无术语）。home 模板：

```go-html-template {file="layouts/index.html"}
<p>共 {{ len .Site.Pages }} 页</p>
{{ range .Site.Pages }}
  <h2><a href="{{ .RelPermalink }}">{{ .LinkTitle }}</a></h2>
{{ end }}
```

实测输出（`range` 留下的空行已省略；共 18 条）：

```html
<p>共 18 页</p>

  <h2><a href="/books/">Books</a></h2>

  <h2><a href="/films/">Films</a></h2>

  <h2><a href="/films/film-3/">Film Three</a></h2>

  <h2><a href="/films/film-2/">Film Two</a></h2>

  <h2><a href="/films/film-1/">Film One</a></h2>

  <h2><a href="/authors/">Authors</a></h2>

  <h2><a href="/genres/">Genres</a></h2>

  <h2><a href="/authors/jausten/">Jausten</a></h2>

  <h2><a href="/books/pride-and-prejudice/">Pride and Prejudice</a></h2>

  <h2><a href="/genres/romance/">Romance</a></h2>

  <h2><a href="/authors/ddmaurier/">Ddmaurier</a></h2>

  <h2><a href="/books/jamaica-inn/">Jamaica Inn</a></h2>

  <h2><a href="/genres/suspense/">Suspense</a></h2>

  <h2><a href="/authors/achristie/">Achristie</a></h2>

  <h2><a href="/books/death-on-the-nile/">Death on the Nile</a></h2>

  <h2><a href="/books/and-then-there-were-none/">And Then There Were None</a></h2>

  <h2><a href="/">Home</a></h2>

  <h2><a href="/tags/">Tags</a></h2>
```

同一站点的 kind 分布（按实测输出统计）：

| kind | 数量 | 说明 |
| --- | --- | --- |
| `home` | 1 | 首页 |
| `section` | 2 | `Books`、`Films` |
| `page` | 7 | 4 本书 + 3 部电影 |
| `taxonomy` | 3 | `Authors`、`Genres`、`Tags`（即使没有术语也会生成分类法页面） |
| `term` | 5 | 3 位作者 + 2 个体裁（`tags` 下没有术语，故无术语页） |

**你应当看到什么**：`Books`、`Films` 这些 section 页与 `Home`、`Tags` 混在同一个列表里，而 `RegularPages` 只有 7 条（全是 `page`）。这就是「别用 `Pages` 列文章」的直观理由。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，单语言站点，Windows。

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| 有内容的最小站点 | `len` → 18；包含全部 kind | 否 |
| 空站点（保留默认分类法） | `len` → 3：`home` 一项 + `tags`、`categories` 两个分类法页面 | 否 |
| `tags` 分类法定义了但没有术语 | 仍有 `Tags` 分类法页面（kind `taxonomy`），但没有术语页面 | 否 |
| `printf "%T" .Site.Pages` | `page.Pages` | 否 |
| 与 [`Site.AllPages`](/methods/site/allpages/) 比较 | 单语言站点实测长度与内容一致（`eq` 为 `true`）；多语言站点下 `AllPages` 含所有语言（实测 6 vs 3） | 否 |
| 排序 | 按[默认排序](g)（实测顺序见上方输出，不等于文件路径字母序） | 否 |

[`RegularPages`]: /methods/site/regularpages/
