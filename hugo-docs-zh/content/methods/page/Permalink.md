+++
title = "Permalink"
linkTitle = "Permalink"
description = "返回给定页面的永久链接。"
date = 2026-10-02
weight = 550
source = "https://gohugo.io/methods/page/permalink/"

[params.functions_and_methods]
signatures = ["PAGE.Permalink"]
returnType = "string"
+++

## 这一页解决什么问题

`.Permalink` 返回页面的**绝对 URL**：`baseURL` + 语言前缀（如有）+ 路径 + 尾斜杠。适合放进 RSS、站点地图、`<link rel="canonical">`、分享链接、Open Graph 的 `og:url` 这类**离开本站**的场合。

它与 [`.RelPermalink`](/methods/page/relpermalink/) 的区别只有一处：绝对还是相对。本站内部的 `<a href>` 应该用 `.RelPermalink`，这样换域名、换子路径部署时都不用改模板。

## 什么时候用，什么时候别用

**该用**：

- RSS / sitemap / canonical / `og:url` 等需要完整 URL 的输出；
- 需要把当前站点地址发给外部系统（Webhook、JSON 输出）。

**别用**：

- 站内 `<a href>` / `<img src>` → 用 [`.RelPermalink`](/methods/page/relpermalink/)（本地 `hugo server` 预览、子路径部署都不会错）；
- 需要资源文件的 URL → 用资源的 `.Permalink`（[`Resources`](/methods/page/resources/) 对象上也有同名方法）；
- 不想被 `baseURL` 影响 → 那就是 `.RelPermalink`。

**选哪个**：

| 场景 | 用哪个 |
| --- | --- |
| 页面里的站内链接 | `.RelPermalink` |
| RSS / sitemap / canonical | `.Permalink` |
| 页面包内图片的 src | 图片资源对象的 `.RelPermalink` |
| 同一份模板想在任意域名下工作 | `.RelPermalink` |

## 用法

项目配置：

```toml
title = 'Documentation'
baseURL = 'https://example.org/docs/'
```

模板：

```go-html-template
{{ $page := .Site.GetPage "/about" }}
{{ $page.Permalink }} → https://example.org/docs/about/
```

## 完整示例：三种 baseURL 下的同一页

模板（`layouts/_default/single.html`）：

```go-html-template {file="layouts/_default/single.html"}
<link rel="canonical" href="{{ .Permalink }}">
<a href="{{ .RelPermalink }}">{{ .LinkTitle }}</a>
```

实测（Hugo 0.167.0，同一份内容，仅改 `baseURL`），页面 `/posts/post-2/`：

| `baseURL` | `.Permalink` | `.RelPermalink` |
| --- | --- | --- |
| `https://example.org/` | `https://example.org/posts/post-2/` | `/posts/post-2/` |
| `https://example.org/docs/` | `https://example.org/docs/posts/post-2/` | `/docs/posts/post-2/` |
| `https://example.org/docs/`（中文页 `/zh/posts/post-1/`） | `https://example.org/docs/zh/posts/post-1/` | `/docs/zh/posts/post-1/` |

**你应当看到什么**：`baseURL` 尾部的 `/docs/` 会出现在**两者**里——`.RelPermalink` 是「相对域名」，不是「相对站点根」。所以把站点部署到子目录时，`.RelPermalink` 依然可以直接用，不需要手工拼 `/docs`。

## 返回值边界（实测）

| 情况 | `.Permalink` | 是否报错 |
| --- | --- | --- |
| 普通页面 | `baseURL` + 路径，以 `/` 结尾（实测） | 否 |
| `baseURL` 带子路径 | 子路径被保留（实测 `https://example.org/docs/posts/post-2/`） | 否 |
| 非默认语言页面 | 含语言段（实测 `…/zh/posts/post-1/`） | 否 |
| 前置元数据设了 `slug` | URL 使用 slug（实测 `/posts/first-post/`） | 否 |
| 关闭美化 URL（`uglyURLs = true`） | 以 `.html` 结尾——上游说明的行为，本站测试站未启用该配置，故不列实测输出 | 否 |
| 通过 `--baseURL` 命令行覆盖 | 立即生效（实测同一次构建内所有页面都改用新值） | 否 |
| 返回类型 | `string`（绝对 URL） | 否 |

更多排查入口见[故障排查](/troubleshooting/)。
