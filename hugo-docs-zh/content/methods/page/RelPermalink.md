+++
title = "RelPermalink"
linkTitle = "RelPermalink"
description = "返回给定页面的相对永久链接。"
date = 2026-10-02
weight = 660
source = "https://gohugo.io/methods/page/relpermalink/"

[params.functions_and_methods]
signatures = ["PAGE.RelPermalink"]
returnType = "string"
+++

## 这一页解决什么问题

`.RelPermalink` 返回页面的**相对 URL**（相对域名），是站内链接的标准写法：

```go-html-template
<a href="{{ .RelPermalink }}">{{ .LinkTitle }}</a>
```

它和 [`.Permalink`](/methods/page/permalink/) 的唯一区别是少了协议与域名（`https://example.org`），但**保留** `baseURL` 里的子路径与语言段。所以把站点从 `https://example.org/` 换到 `https://example.org/docs/`，或者换域名，`.RelPermalink` 写出来的链接全都自动正确。

## 什么时候用，什么时候别用

**该用**：

- 模板里一切站内 `<a href>`、`<img src>`、`<link href>`；
- `hugo server` 本地预览（本地端口与线上域名不同的情况下也正确）；
- 想给静态检查工具提供「站内引用」。

**别用**：

- RSS、sitemap、canonical、`og:url` 等**离开本站**的输出 → 用 [`.Permalink`](/methods/page/permalink/)（相对链接在阅读器里无法解析）；
- 需要包含查询串或锚点 → 自己拼在返回值之后；
- 想要页面在磁盘上的路径 → 用 [`.Path`](/methods/page/path/) 或 [`.File`](/methods/page/file/)。

**选哪个**：

| 场景 | 用哪个 |
| --- | --- |
| 站内 `<a href>` | `.RelPermalink` |
| RSS / canonical / og:url | `.Permalink` |
| 稳定标识（与 URL 无关） | `.Path` |

## 用法

项目配置：

```toml
title = 'Documentation'
baseURL = 'https://example.org/docs/'
```

模板：

```go-html-template
{{ $page := .Site.GetPage "/about" }}
{{ $page.RelPermalink }} → /docs/about/
```

## 完整示例：站内导航

模板（`layouts/_default/list.html`）：

```go-html-template {file="layouts/_default/list.html"}
<ul>
  {{ range .RegularPages.ByWeight }}
    <li><a href="{{ .RelPermalink }}">{{ .LinkTitle }}</a></li>
  {{ end }}
</ul>
```

实测（`baseURL = 'https://example.org/'`，`/posts/` 下有 8 个常规页面），渲染 `/posts/` 时列表项链接为：

```html
<li><a href="/posts/post-1/">第一篇</a></li>
<li><a href="/posts/post-2/">第二篇</a></li>
```

把同一次构建换成 `hugo --baseURL 'https://example.org/docs/'` 后，同一模板实测输出：

```html
<li><a href="/docs/posts/post-1/">第一篇</a></li>
<li><a href="/docs/posts/post-2/">第二篇</a></li>
```

**你应当看到什么**：模板一个字没改，链接自动带上了 `/docs` 前缀。中文页同理——实测 `/zh/posts/post-1/` 的 `.RelPermalink` 在子路径部署下是 `/docs/zh/posts/post-1/`。

## 返回值边界（实测）

| 情况 | `.RelPermalink` | 是否报错 |
| --- | --- | --- |
| 普通页面 | 以 `/` 开头、以 `/` 结尾（实测 `/posts/post-2/`） | 否 |
| `baseURL` 带子路径 | 子路径被保留（实测 `/docs/posts/post-2/`） | 否 |
| 非默认语言页面 | 含语言段（实测 `/docs/zh/posts/post-1/`） | 否 |
| 前置元数据设了 `slug` | 使用 slug（实测 `/posts/first-post/`） | 否 |
| 首页 | `/`（或子路径部署时的 `/docs/`）——上游用法中 `.Permalink` 与 `.RelPermalink` 成对出现，本站未单独实测首页值 | 否 |
| 与 `.Permalink` 的关系 | 由 `.Permalink` 去掉协议与域名得到；两者只差这一部分 | 否 |
| 返回类型 | `string` | 否 |

更多排查入口见[故障排查](/troubleshooting/)。
