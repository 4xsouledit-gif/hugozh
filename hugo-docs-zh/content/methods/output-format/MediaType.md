+++
title = "MediaType"
linkTitle = "MediaType"
description = "返回给定输出格式的媒体类型。"
date = 2026-10-02
weight = 10
source = "https://gohugo.io/methods/output-format/mediatype/"

[params.functions_and_methods]
signatures = ["OUTPUTFORMAT.MediaType"]
returnType = "media.Type"
+++

## 这一页解决什么问题

`MediaType` 返回输出格式的[媒体类型](g)（media type）对象。写 `<link>` 的 `type` 属性、判断「这份输出是什么类型的文件」、取「该用哪个文件后缀」都靠它。Hugo 的 `media.Type` 把媒体类型拆成主类型（`MainType`）、子类型（`SubType`）与可能的文件后缀列表（`Suffixes`）。

## 什么时候用，什么时候别用

**该用**：

- 生成 `<link type="…">`、`<script type="…">`：把 `.MediaType` 直接当字符串用就是完整的媒体类型（实测 `application/rss+xml`、`text/html`）；
- 需要文件后缀（拼文件名、写重定向规则）→ `Suffixes`（切片）或 `FirstSuffix.Suffix`（第一个）；
- 需要拆开判断主类型或子类型 → `MainType` / `SubType`。

**别用**：

- 需要输出格式的标识符 → 用 [`Name`](/methods/output-format/name/)（`rss` 是标识符，`application/rss+xml` 才是媒体类型）；
- 需要地址 → 用 [`Permalink`](/methods/output-format/permalink/) 或 [`RelPermalink`](/methods/output-format/relpermalink/)；
- 想判断 `link` 元素的 `rel` 值 → 用 [`Rel`](/methods/output-format/rel/)；
- 以为「不写 `mediaType` 也能拿到后缀」：实测自定义输出格式不写 `mediaType` 时，`.MediaType` 是**空媒体类型**（`Type`、`Suffixes` 都是空），地址也不带后缀——不报错，但结果不是你想要的。

## 基本用法

要使用该方法，你必须先通过 [`Get`][] 或 [`Canonical`][] 方法，从页面的 [`OutputFormats`][] 集合中选出特定的 [output format](g)（输出格式）。

## 示例

```go-html-template
{{ with .Site.Home.OutputFormats.Get "rss" }}
  {{ with .MediaType }}
    {{ .Type }} → application/rss+xml
    {{ .MainType }} → application
    {{ .SubType }} → rss
    {{ .Suffixes }} → [rss]
    {{ .FirstSuffix.Suffix }} → rss
  {{ end }}
{{ end }}
```

> [!NOTE]
> 实测（Hugo 0.167.0）默认 `rss` 输出格式的 `Suffixes` 是 `[xml rss]`、`FirstSuffix.Suffix` 是 `xml`，与上面上游示例里写的 `[rss]` / `rss` 不同——后缀来自媒体类型定义，而 `rss` 是**标识符**。以实测为准。

## 方法

在 `MediaType` 对象上使用这些方法。

`Type`
: (`string`) 返回媒体类型。

`MainType`
: (`string`) 返回媒体类型的主类型。

`SubType`
: (`string`) 返回媒体类型的子类型。

`Suffixes`
: (`slice`) 返回媒体类型可能的文件后缀切片。

`FirstSuffix.Suffix`
: (`string`) 返回媒体类型可能的文件后缀中的第一个。

## 完整示例：把媒体类型写进 `link` 的 `type` 属性

```go-html-template {file="layouts/_partials/head.html"}
{{ with site.Home.OutputFormats.Get "rss" }}
  <link rel="{{ .Rel }}" type="{{ .MediaType }}" href="{{ .RelPermalink }}">
{{ end }}
```

测量条件：Hugo 0.167.0 extended，单语言最小站点，`baseURL = "https://example.org/"`。Hugo 渲染为：

```html
  <link rel="alternate" type="application/rss&#43;xml" href="/index.xml">
```

**你应当看到什么**：`type` 属性里是完整的媒体类型。产物里的 `&#43;` 是 html/template 对 `+` 做的 HTML 转义，浏览器解析属性值后仍是 `application/rss+xml`——不要以为渲染错了。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，单语言站点，Windows。

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| 首页 `html` 输出格式 | `Type` 为 `text/html`；`MainType` 为 `text`、`SubType` 为 `html`；`Suffixes` 为 `[html htm]`、`FirstSuffix.Suffix` 为 `html` | 否 |
| 首页 `rss` 输出格式 | `Type` 为 `application/rss+xml`；`MainType` 为 `application`、`SubType` 为 `rss`；`Suffixes` 为 `[xml rss]`、`FirstSuffix.Suffix` 为 `xml` | 否 |
| 自定义 `[mediaTypes.'text/markdown'] suffixes = ['md','markdown']` | `Suffixes` 为 `[md markdown]`——顺序即配置顺序；`FirstSuffix.Suffix` 为 `md` | 否 |
| 带结构化后缀的媒体类型（`application/ld+json`） | `Type` 为 `application/ld+json`，但 `MainType` 为 `application`、`SubType` 为 `ld`（`+json` 不计入子类型） | 否 |
| 自定义输出格式没写 `mediaType` | 空媒体类型：`Type` 为空串、`Suffixes` 为空切片；`.Permalink` 为 `https://example.org/bare`（无后缀） | 否 |
| `Get` 取不到（该格式没启用） | 空值：`.MediaType` 为空，`Type` 是空串；`with` 判为假 | 否 |
| 返回类型 | `media.Type`（对象）；直接当字符串用得到完整媒体类型 | 否 |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 没报错但结果不对 | `type` 属性里出现 `&#43;` | html/template 对 `+` 做 HTML 转义 | 不用改：浏览器解析后仍是 `application/rss+xml` |
| 没报错但结果不对 | 以为 `.Suffixes` 给出的是标识符 | `Suffixes` 是文件后缀（`xml`、`rss`），标识符在 `.Name` | 标识符用 [`Name`](/methods/output-format/name/)，后缀用 `FirstSuffix.Suffix` |
| 没报错但结果不对 | 自定义输出格式的地址没有后缀 | 配置里没写 `mediaType` | 在 `[outputFormats.x]` 里补上 `mediaType` |
| 报错看不懂 | 对取不到的对象继续取 `.MediaType.Type`，结果是个空串 | `Get` 取不到给空值，不报错 | 用 `with` 包住整段 |

更多排查入口见[故障排查](/troubleshooting/)。

[`Canonical`]: /methods/page/outputformats/#canonical
[`Get`]: /methods/page/outputformats/#get
[`OutputFormats`]: /methods/page/outputformats/
