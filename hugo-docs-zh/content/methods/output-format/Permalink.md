+++
title = "Permalink"
linkTitle = "Permalink"
description = "返回当前输出格式所生成页面的永久链接。"
date = 2026-10-02
weight = 30
source = "https://gohugo.io/methods/output-format/permalink/"

[params.functions_and_methods]
signatures = ["OUTPUTFORMAT.Permalink"]
returnType = "string"
+++

## 这一页解决什么问题

`Permalink` 返回「当前输出格式生成的那份文件」的**绝对地址**：带协议、域名，站点部署在子路径时还带上子路径。写 RSS 自动发现、Open Graph、结构化数据、sitemap、邮件模板时，消费方要的是完整地址，相对地址会被拒收——这就是它与 [`RelPermalink`](/methods/output-format/relpermalink/) 的分工。

注意「当前输出格式」四个字：首页的 `html` 格式给出 `https://example.org/`，`rss` 格式给出 `https://example.org/index.xml`，两者不是同一个地址。

## 什么时候用，什么时候别用

**该用**：

- 需要完整地址的场合：`<link rel="alternate" type="application/rss+xml">` 自动发现、Open Graph、结构化数据、分享卡片；
- 同一份模板要同时跑本地预览、测试环境与线上域名：地址随 `baseURL` 自动变化。

**别用**：

- 站内的 `<a href>`、`<link rel="stylesheet">`、`<img src>` → 用 [`RelPermalink`](/methods/output-format/relpermalink/)：绝对地址会把读者从预览环境带到线上域名；
- 只想知道格式名或后缀 → 用 [`Name`](/methods/output-format/name/)、[`MediaType`](/methods/output-format/mediatype/)；
- 想拿「页面本身」的永久链接 → 用页面上的 [`Permalink`](/methods/page/permalink/) 方法；本页的方法挂在 `OutputFormat` 对象上，给出的是**该输出格式**的地址。

## 基本用法

要使用该方法，你必须先通过 [`Get`][] 或 [`Canonical`][] 方法，从页面的 [`OutputFormats`][] 集合中选出特定的 [output format](g)（输出格式）。

```go-html-template
{{ with .Site.Home.OutputFormats.Get "rss" }}
  {{ .Permalink }} → https://example.org/index.xml
{{ end }}
```

## 完整示例：给 RSS 加自动发现链接

```go-html-template {file="layouts/_partials/head.html"}
{{ with site.Home.OutputFormats.Get "rss" }}
  <link rel="alternate" type="application/rss+xml" href="{{ .Permalink }}">
{{ end }}
```

`baseURL = "https://example.org/"` 时，Hugo 渲染为：

```html
  <link rel="alternate" type="application/rss+xml" href="https://example.org/index.xml">
```

把同一份模板放到 `baseURL = "https://example.org/docs/"`（站点部署在子路径）下，实测渲染为：

```html
  <link rel="alternate" type="application/rss+xml" href="https://example.org/docs/index.xml">
```

**你应当看到什么**：地址始终以 `baseURL` 开头（`baseURL` 的结尾斜杠不能少），子路径部署时 `/docs/` 也在里面。这正是 RSS 阅读器与抓取机器人需要的绝对地址。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，单语言站点，Windows。

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| 首页 `html` 输出格式 | `https://example.org/` | 否 |
| 首页 `rss` 输出格式 | `https://example.org/index.xml` | 否 |
| `baseURL = "https://example.org/docs/"` | `https://example.org/docs/index.xml`（**带上站点子路径**） | 否 |
| 自定义 `baseName = 'search'` 的 `application/json` 输出格式 | `https://example.org/docs/search.json` | 否 |
| 输出格式没有配置 `mediaType` | `https://example.org/bare`——**没有后缀**（没有媒体类型可推断后缀） | 否 |
| `Get` 取不到（名字没启用） | 空串（`with` 判为假），不会走到这里；不判断就直接用会得到 `href=""` | 否 |
| 返回类型 | `string`，永远不会是 `nil` | 否 |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 没报错但结果不对 | RSS 自动发现的地址是 `https://example.org/`，指向首页 | 取的是 `html`（规范输出格式），不是 `rss` | 用 `Get "rss"` 明确指定格式 |
| 没报错但结果不对 | 线上地址对了，本地预览却跳到线上域名 | 站内链接用了 `Permalink` | 站内改用 [`RelPermalink`](/methods/output-format/relpermalink/) |
| 没报错但结果不对 | 产物里出现 `href=""` | `Get` 取不到时给的是空值，不报错 | 用 `with` 包住，或先检查该 kind 是否启用了这个格式 |
| 没报错但结果不对 | 子路径部署后子目录丢失 | `baseURL` 没写站点子路径（或结尾少了 `/`） | `baseURL` 与真实部署位置一致，构建时也可用 `--baseURL` 覆盖 |

更多排查入口见[故障排查](/troubleshooting/)。

[`Canonical`]: /methods/page/outputformats/#canonical
[`Get`]: /methods/page/outputformats/#get
[`OutputFormats`]: /methods/page/outputformats/
