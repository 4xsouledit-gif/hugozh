+++
title = "AlternativeOutputFormats"
linkTitle = "AlternativeOutputFormats"
description = "返回 OutputFormat 对象切片，其中不含当前输出格式，每项代表该页面启用的一个输出格式。"
date = 2026-10-02
weight = 40
source = "https://gohugo.io/methods/page/alternativeoutputformats/"

[params.functions_and_methods]
signatures = ["PAGE.AlternativeOutputFormats"]
returnType = "page.OutputFormats"
+++

## 这一页解决什么问题

一个页面可以同时发布成多种格式（HTML、RSS、JSON、AMP……）。`AlternativeOutputFormats` 给出**除当前格式以外**的那些格式，典型用途是在 `<head>` 里声明备选链接，让浏览器、阅读器与搜索引擎发现 RSS/JSON 版本。

## 什么时候用，什么时候别用

**该用**：

- 在页面 `<head>` 里输出 `<link rel="alternate">`，指向 `index.xml`、`index.json` 这类备选输出；
- 想知道「这个页面除了 HTML 还发布了什么」。

**别用**：

- 想要**全部**输出格式（含当前正在渲染的这个）→ 用 `OutputFormats`；
- 只想判断某个格式是否存在并取它的地址 → 用 `OutputFormats.Get "rss"` 更直接；
- 普通内容页通常只配置了 `html` 一种输出，此时本方法返回空切片——这不是出错，见下文。

## 用法

[输出格式（output format）](/quick-reference/glossary/output-format/)

`Page` 对象上的 `AlternativeOutputFormats` 方法返回一个 `OutputFormat` 对象切片，其中不包含当前输出格式，每一项代表给定页面启用的一个输出格式。详见[说明][]。

例如，为每个备选输出格式各生成一个 `link` 元素：

```go-html-template
{{ range .AlternativeOutputFormats }}
  {{ printf "<link rel=%q type=%q href=%q>" .Rel .MediaType.Type .Permalink | safeHTML }}
{{ end }}
```

Hugo 渲染出的结果大致如下：

```html
<link rel="alternate" type="application/rss+xml" href="https://example.org/index.xml">
<link rel="alternate" type="application/json" href="https://example.org/index.json">
```

## 完整示例：声明首页的 RSS 备选链接

最小站点：`hugo.toml` 使用默认输出格式（首页是 `['html', 'rss']`）。把上游示例放进 `layouts/index.html`：

```go-html-template {file="layouts/index.html"}
{{ range .AlternativeOutputFormats }}
  {{ printf "<link rel=%q type=%q href=%q>" .Rel .MediaType.Type .Permalink | safeHTML }}
{{ end }}
```

`hugo --source <站点目录> --ignoreCache` 构建后，首页输出：

```html
<link rel="alternate" type="application/rss+xml" href="https://example.org/index.xml">
```

**你应当看到什么**：`.Rel` 是 `alternate`，`.MediaType.Type` 是 RSS 的媒体类型，`.Permalink` 是**绝对 URL**（上游示例中还有一条 JSON，那是因为它的站点额外配置了 JSON 输出格式）。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，Windows；`baseURL = 'https://example.org/'`；首页使用默认输出（`html` + `rss`），内容页只配置 `html` 输出。

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| 首页（`html` + `rss`） | 一项：`rss`，`.Permalink` 为 `https://example.org/index.xml` | 否 |
| 内容页（只配置 `html`） | 空切片，`range` 不输出任何内容 | 否 |
| 当前正在渲染的格式 | **不会**出现在结果里 | 否 |
| 返回类型 | `page.OutputFormats`，元素含 `.Name`、`.Rel`、`.MediaType`、`.Permalink`、`.RelPermalink` | 否 |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 什么都没输出 | 页面模板里 `range .AlternativeOutputFormats` 空转 | 该页面种类只配置了 `html` 输出 | 在 `hugo.toml` 的 `[outputs]` 中为该页面种类加上 `rss` 等格式 |
| 没报错但结果不对 | 想输出「当前格式」的链接却拿不到 | 本方法刻意排除当前格式 | 用 `.OutputFormats`，或直接写 `.RelPermalink` |
| 输出被转义 | 页面里出现 `&lt;link&gt;` 而不是 `<link>` | `printf` 的返回值被当作普通文本 | 按上游示例接 `| safeHTML` |

更多排查入口见[故障排查](/troubleshooting/)。

[说明]: /configuration/output-formats/
