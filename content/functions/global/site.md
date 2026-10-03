+++
title = "site"
linkTitle = "site"
description = "返回当前站点的 Site 对象，在任何上下文中都可访问。"
date = 2026-10-02
weight = 30
source = "https://gohugo.io/functions/global/site/"

[params.functions_and_methods]
signatures = ["site"]
returnType = "page.siteWrapper"
+++

## 这一页解决什么问题

`site` 让你**不受当前上下文影响**地拿到当前站点的 `Site` 对象：不管现在是在页面模板、局部模板，还是被 `range` / `with` 改了 `.` 的代码块里，`site.Title` 都指当前站点。它取代了以前写 `.Site` / `$.Site` 的两种写法，模板更短也更稳。

## 什么时候用，什么时候别用

**该用**：

- 任何需要站点级数据的地方：`site.Title`、`site.Params.*`、`site.RegularPages`、`site.Menus.*`；
- 上下文里没有 `Site`（例如渲染钩子、深层局部模板）；
- 想统一写法：上游建议无论上下文有没有 `Site` 都用全局 `site`。

**别用**：

- 需要跨语言取站点 → 用 [`site.Sites`](/methods/site/sites/) / [`site.Languages`](/methods/site/languages/)；`site` 返回的是**当前语言**的站点；
- 需要当前页面所属的 section → 用 [`.CurrentSection`](/methods/page/currentsection/) 等页面方法；
- 需要遍历所有页面 → `site.RegularPages` / `site.Pages` / `site.AllPages`（见[方法文档](/methods/site/regularpages/)）。

用 `site` 函数可以不受当前上下文影响地返回 `Site` 对象。

```go-html-template
{{ site.Params.foo }}
```

当上下文里有 `Site` 对象时，你可以使用 `Site` 属性：

```go-html-template
<!-- current context -->
{{ .Site.Params.foo }}
<!-- template context -->
{{ $.Site.Params.foo }}
```

> [!NOTE]
> 为了简化模板，无论上下文里有没有 `Site` 对象，都请使用全局 `site` 函数。

## 完整示例（实测）

最小站点：`title = "Teach Test"`，`[params] foo = "bar"`。

```go-html-template
SITE-TITLE: {{ site.Title }}
SITE-PARAM: {{ site.Params.foo }}
DOT-SITE: {{ .Site.Params.foo }}
```

Hugo 0.167.0 实测渲染：

```text
SITE-TITLE: Teach Test
SITE-PARAM: bar
DOT-SITE: bar
```

**你应当看到什么**：`site.Params.foo` 与 `.Site.Params.foo` 取值相同；全局 `site` 在上下文里没有 `Site` 时也能用。

## 返回值边界（实测）

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| 站点配置了 `title` / `params` | `site.Title`、`site.Params.foo` 可读（实测 `Teach Test` / `bar`） | 否 |
| `.Site.Params.foo` 与 `site.Params.foo` | 实测结果相同 | 否 |
| 返回类型 | `page.siteWrapper`（可当 `Site` 使用） | 否 |
