+++
title = "Site 方法"
linkTitle = "Site"
description = "在 Site 对象上使用这些方法。"
date = 2026-10-02
weight = 100
source = "https://gohugo.io/methods/site/"
aliases = ["/variables/site/"]
+++

## 这一页解决什么问题

`Site` 对象（模板里的 `.Site` 或 `site`）代表**当前站点**：它是哪个语言、哪个版本、哪个角色，叫什么名字，有哪些页面、栏目、菜单、分类法，以及配置里写了什么。

本章的 27 个方法可以归纳成六类：

- **站点标识与配置**：`Title`、`Copyright`、`BaseURL`、`Params`、`Param`、`Config`；
- **时间与数据**：`Lastmod`、`Data`；
- **页面集合**：`Home`、`Pages`、`RegularPages`、`Sections`、`MainSections`、`GetPage`；
- **导航与分类法**：`Menus`、`Taxonomies`；
- **维度**（语言 / 版本 / 角色）：`Language`、`LanguagePrefix`、`Languages`、`Version`、`Role`、`Dimension`、`IsDefault`、`Sites`；
- **跨模板共享数据**：`Store`。

写 base 模板、页头页脚、导航、语言或版本切换器时，几乎都要从这一章挑方法。

## 读完本章你应该能够

- 分清 `Params` / `Param` / `Config` 各读的是配置里的哪一部分，并说明为什么 `[params]` 与 `[services]` 要用不同方法读；
- 在 `Pages`、`RegularPages`、`Sections` 之间做出选择，并知道 `Pages` 会混进首页与分类法页面；
- 用 `MainSections` 写出不硬编码栏目名的首页列表，并知道未配置时的回退规则；
- 用 `GetPage` 按路径取页面，并为「路径不存在返回 `nil`」写好兜底；
- 用 `Menus` 渲染导航并高亮当前项，知道为什么这里不能用 `partialCached`；
- 说清 `Taxonomies` 的三层结构与「未配置 vs 配置了但没术语」在 `len` 上的差别；
- 用 `Language` / `Version` / `Role` / `Dimension` / `IsDefault` 处理多语言、多版本、多角色站点；
- 用 `Store` 在 partial、shortcode 与父模板之间传递数据，并知道它的生命周期只有一次构建。

## 什么时候用本章的方法，什么时候别用

**该用**：

- 需要**站点级**信息或集合（站点名、全部文章、栏目、菜单、分类法、当前语言）；
- 模板要在多语言/多版本/多角色矩阵里正确工作。

**别用**：

- 需要**页面级**信息（标题、日期、参数、上下篇、资源）→ 用 [methods/page](/methods/page/)；
- 需要**集合的排序、分组、分页** → 用 [methods/pages](/methods/pages/) 上的方法（如 `ByTitle`、`GroupBy`、`Paginate`）；
- 需要**时间加减与格式化** → 用 [methods/time](/methods/time/) 与 [functions/time](/functions/time/)；
- 需要**分类法页面内**的术语排序 → 用 [methods/taxonomy](/methods/taxonomy/) 的 `Alphabetical` / `ByCount`。

本章里最容易混的四对同名前缀：`Params` 与 `Param`（整张表 vs 查一个键）、`Pages` 与 `RegularPages`（全部 kind vs 只要常规页面）、`Sections` 与 `MainSections`（页面对象 vs 字符串切片）、`Language` 与 `Languages`（当前语言 vs 语言集合）。

## 阅读顺序

按「先认站点 → 再取内容 → 后处理维度」用：

1. **站点是谁**：[Site.Title](/methods/site/title/) → [Site.Copyright](/methods/site/copyright/) → [Site.BaseURL](/methods/site/baseurl/) → [Site.Params](/methods/site/params/) → [Site.Param](/methods/site/param/) → [Site.Config](/methods/site/config/)
2. **内容与时间**：[Site.Home](/methods/site/home/) → [Site.Pages](/methods/site/pages/) → [Site.RegularPages](/methods/site/regularpages/) → [Site.Sections](/methods/site/sections/) → [Site.MainSections](/methods/site/mainsections/) → [Site.GetPage](/methods/site/getpage/) → [Site.Lastmod](/methods/site/lastmod/) → [Site.Data](/methods/site/data/)
3. **导航与分类**：[Site.Menus](/methods/site/menus/) → [Site.Taxonomies](/methods/site/taxonomies/)
4. **语言、版本与角色**：[Site.Language](/methods/site/language/) → [Site.LanguagePrefix](/methods/site/languageprefix/) → [Site.Version](/methods/site/version/) → [Site.Role](/methods/site/role/) → [Site.Dimension](/methods/site/dimension/) → [Site.IsDefault](/methods/site/isdefault/) → [Site.Languages](/methods/site/languages/) → [Site.Sites](/methods/site/sites/)
5. **共享数据**：[Site.Store](/methods/site/store/)
6. **已弃用（了解即可）**：[Site.AllPages](/methods/site/allpages/) → [Site.BuildDrafts](/methods/site/builddrafts/)

只想先跑起来，走 1 → 2 即可；做多语言或文档版本站时再回来看第 4 组。

## 一个能跑通的最小示例

在最小站点（`title = 'My Documentation Site'`，`content/books/` 4 页、`content/films/` 3 页，`mainSections = ['books','films']`）的 home 模板里：

```go-html-template {file="layouts/index.html"}
<h1>{{ .Site.Title }}</h1>
<p>共 {{ len .Site.RegularPages }} 篇，{{ len .Site.Sections }} 个栏目</p>
{{ range where .Site.RegularPages "Section" "in" .Site.MainSections }}
  <h2><a href="{{ .RelPermalink }}">{{ .LinkTitle }}</a></h2>
{{ end }}
```

Hugo 渲染为（`range` 的空白已省略）：

```html
<h1>My Documentation Site</h1>
<p>共 7 篇，2 个栏目</p>

  <h2><a href="/films/film-3/">Film Three</a></h2>

  <h2><a href="/films/film-2/">Film Two</a></h2>

  <h2><a href="/films/film-1/">Film One</a></h2>

  <h2><a href="/books/pride-and-prejudice/">Pride and Prejudice</a></h2>

  <h2><a href="/books/jamaica-inn/">Jamaica Inn</a></h2>

  <h2><a href="/books/death-on-the-nile/">Death on the Nile</a></h2>

  <h2><a href="/books/and-then-there-were-none/">And Then There Were None</a></h2>
```

**你应当看到什么**：`Site.Title` 直接来自配置；`RegularPages` 只数文章（7，不含栏目与分类法页面）；`where … "in" .Site.MainSections` 让栏目名完全由配置决定——这就是本章要解决的核心问题。
