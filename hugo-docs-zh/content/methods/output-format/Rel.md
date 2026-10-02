+++
title = "Rel"
linkTitle = "Rel"
description = "返回给定输出格式的 rel 值，可以是默认值，也可以是项目配置中定义的值。"
date = 2026-10-02
weight = 40
source = "https://gohugo.io/methods/output-format/rel/"

[params.functions_and_methods]
signatures = ["OUTPUTFORMAT.Rel"]
returnType = "string"
+++

## 这一页解决什么问题

`Rel` 返回写进 `<link rel="…">` 里的那个值。它由两处决定：

1. **默认**：规范输出格式（canonical，通常是 `html`）得到 `canonical`，其余可替换输出格式得到 `alternate`；
2. **项目配置**：给该输出格式写了 `rel` 就以配置为准（实测写成 `rel = 'search'` 后 `.Rel` 返回 `search`）。

模板里不要把 `"alternate"` 硬编码——主题一旦被别的站点复用，或者用户改了配置，硬编码的值就和实际不符了。

## 什么时候用，什么时候别用

**该用**：

- 生成 `<link rel="{{ .Rel }}" type="…" href="…">`：让规范格式与备用格式各自得到正确的值；
- 需要区分「这一份是不是规范输出格式」：规范的那份实测 `.Rel` 为 `canonical`。

**别用**：

- 需要地址 → 用 [`Permalink`](/methods/output-format/permalink/) 或 [`RelPermalink`](/methods/output-format/relpermalink/)；
- 需要 `type` 属性 → 用 [`MediaType.Type`](/methods/output-format/mediatype/)；
- 想让某份输出**不出现在** `rel="alternate"` 列表里 → 那是输出格式的 `notAlternative` 配置项，不是 `Rel`。实测把 `notAlternative = true` 的自定义格式取出来，`.Rel` 仍然是 `alternate`。

## 基本用法

要使用该方法，你必须先通过 [`Get`][] 或 [`Canonical`][] 方法，从页面的 [`OutputFormats`][] 集合中选出特定的 [output format](g)（输出格式）。

```go-html-template
{{ with .Site.Home.OutputFormats.Get "rss" }}
  {{ .Rel }} → alternate
{{ end }}
```

## 完整示例：同时输出备用 feed 与规范地址

```go-html-template {file="layouts/_partials/head.html"}
{{ with site.Home.OutputFormats.Get "rss" }}
  <link rel="{{ .Rel }}" type="{{ .MediaType.Type }}" href="{{ .RelPermalink }}">
{{ end }}
{{ with site.Home.OutputFormats.Canonical }}
  <link rel="{{ .Rel }}" href="{{ .Permalink }}">
{{ end }}
```

测量条件：Hugo 0.167.0 extended，单语言最小站点，`baseURL = "https://example.org/"`，首页输出格式为默认的 `html` 与 `rss`。Hugo 渲染为：

```html
  <link rel="alternate" type="application/rss&#43;xml" href="/index.xml">
  <link rel="canonical" href="https://example.org/">
```

**你应当看到什么**：`rss` 拿到了 `alternate`，规范输出格式（`html`）拿到了 `canonical`，地址一个用相对、一个用绝对。第一行的 `&#43;` 是 html/template 对 `+` 做 HTML 转义的结果，浏览器解析属性值后仍是 `application/rss+xml`。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，单语言站点，Windows。

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| 首页 `rss`，配置里没写 `rel` | `alternate` | 否 |
| 首页 `Canonical`（`html`） | `canonical` | 否 |
| 自定义输出格式配置了 `rel = 'search'` | `search`——配置优先于默认值 | 否 |
| 自定义输出格式配置了 `notAlternative = true` | 仍是 `alternate`——该配置**不影响** `.Rel` | 否 |
| `Get` 取不到（该格式没启用） | 空串（`with` 判为假）；不判断直接用会得到 `rel=""` | 否 |
| 返回类型 | `string`，永远不会是 `nil` | 否 |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 没报错但结果不对 | 自定义输出格式在 `<link>` 里被标成 `alternate`，不符合预期 | `rel` 默认就是 `alternate`，`notAlternative` 只管「要不要列进备用格式」 | 给该输出格式显式配置 `rel` |
| 没报错但结果不对 | 两个 `<link>` 都拿到 `canonical`，或都拿到 `alternate` | 分别用了 `.OutputFormats.Canonical` 与 `Get`，取到的不是同一个对象 | 想标备用格式就用 `Get`，想标规范格式才用 `Canonical` |
| 没报错但结果不对 | 产物里出现 `rel=""` | `Get` 取不到时不报错，给的是空值 | 用 `with` 包住整段 |
| 报错看不懂 | 提示找不到 `Rel` 字段 | 对页面（而不是 `OutputFormat` 对象）取了 `.Rel` | 先用 `Get`/`Canonical` 取出对象再取 `.Rel` |

更多排查入口见[故障排查](/troubleshooting/)。

[`Canonical`]: /methods/page/outputformats/#canonical
[`Get`]: /methods/page/outputformats/#get
[`OutputFormats`]: /methods/page/outputformats/
