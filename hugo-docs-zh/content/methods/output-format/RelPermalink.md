+++
title = "RelPermalink"
linkTitle = "RelPermalink"
description = "返回当前输出格式所生成页面的相对永久链接。"
date = 2026-10-02
weight = 50
source = "https://gohugo.io/methods/output-format/relpermalink/"

[params.functions_and_methods]
signatures = ["OUTPUTFORMAT.RelPermalink"]
returnType = "string"
+++

## 这一页解决什么问题

`RelPermalink` 返回「当前输出格式生成的那份文件」的**根相对地址**：以 `/` 开头，不带协议与域名，但**带站点子路径**。它适合放进同站的 `<a href>`、`<link href>`、`<img src>`——换域名、换预览端口都不影响。

它与 [`Permalink`](/methods/output-format/permalink/) 的唯一差别就是「带不带域名」：实测首页 `rss` 格式在 `baseURL = "https://example.org/"` 下是 `/index.xml`，在 `https://example.org/docs/` 下是 `/docs/index.xml`。

## 什么时候用，什么时候别用

**该用**：

- 同站链接：`<a href>`、`<link rel="stylesheet" href>`、`<img src>`、`<link rel="alternate" href>`；
- 需要地址随 `baseURL` 的子路径自动调整，而不希望把域名写进产物。

**别用**：

- 需要**绝对地址**的场合：RSS/Atom 自动发现、Open Graph、结构化数据、邮件模板 → 用 [`Permalink`](/methods/output-format/permalink/)；
- 只想知道格式名或后缀 → 用 [`Name`](/methods/output-format/name/)、[`MediaType`](/methods/output-format/mediatype/)；
- 想拿页面本身（而不是某个输出格式）的相对地址 → 用页面上的 [`RelPermalink`](/methods/page/relpermalink/) 方法。

## 基本用法

要使用该方法，你必须先通过 [`Get`][] 或 [`Canonical`][] 方法，从页面的 [`OutputFormats`][] 集合中选出特定的 [output format](g)（输出格式）。

```go-html-template
{{ with .Site.Home.OutputFormats.Get "rss" }}
  {{ .RelPermalink }} → /index.xml
{{ end }}
```

## 完整示例：给页面加上 RSS 链接

```go-html-template {file="layouts/_partials/head.html"}
{{ with site.Home.OutputFormats.Get "rss" }}
  <link rel="alternate" type="application/rss+xml" href="{{ .RelPermalink }}">
{{ end }}
```

`baseURL = "https://example.org/"` 时，Hugo 渲染为：

```html
  <link rel="alternate" type="application/rss+xml" href="/index.xml">
```

把 `baseURL` 换成 `https://example.org/docs/` 后，实测渲染为：

```html
  <link rel="alternate" type="application/rss+xml" href="/docs/index.xml">
```

**你应当看到什么**：地址以 `/` 开头，没有域名；子路径部署时 `/docs/` 前缀自动出现——这正是它与 [`Permalink`](/methods/output-format/permalink/) 的差别。若同时在页面上输出两种格式的列表，实测 `html` 得到 `/docs/`、`rss` 得到 `/docs/index.xml`。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，单语言站点，Windows。

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| 首页 `html` 输出格式 | `/`（子路径部署时 `/docs/`） | 否 |
| 首页 `rss` 输出格式 | `/index.xml`（子路径部署时 `/docs/index.xml`） | 否 |
| 自定义 `baseName = 'search'` 的 `application/json` 输出格式 | `/docs/search.json` | 否 |
| 输出格式没有配置 `mediaType` | `/bare`——没有后缀 | 否 |
| `Get` 取不到（名字没启用） | 空串（`with` 判为假）；不判断直接拼进属性会得到 `href=""` | 否 |
| 返回类型 | `string`，永远不会是 `nil` | 否 |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 没报错但结果不对 | RSS 阅读器抓不到 feed | 写进了相对地址，消费方要求绝对地址 | 改用 [`Permalink`](/methods/output-format/permalink/) |
| 没报错但结果不对 | 站点部署到子路径后链接 404 | `baseURL` 没写子路径，或漏了结尾斜杠 | 让 `baseURL` 与部署位置一致，必要时用 `--baseURL` 覆盖 |
| 没报错但结果不对 | 产物里出现 `href=""` | `Get` 取不到时给空值，不报错 | 用 `with` 包住整段 |
| 报错看不懂 | 页面里原样出现 `{{ .RelPermalink }}` 字样 | 把模板代码写进了内容 Markdown：内容文件不是模板 | 在模板里生成地址，或改用短代码 |

更多排查入口见[故障排查](/troubleshooting/)。

[`Canonical`]: /methods/page/outputformats/#canonical
[`Get`]: /methods/page/outputformats/#get
[`OutputFormats`]: /methods/page/outputformats/
