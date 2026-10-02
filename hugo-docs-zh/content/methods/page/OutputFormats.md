+++
title = "OutputFormats"
linkTitle = "OutputFormats"
description = "返回一组 OutputFormat 对象，每个对象对应该页面已启用的一种输出格式。"
date = 2026-10-02
weight = 460
source = "https://gohugo.io/methods/page/outputformats/"

[params.functions_and_methods]
signatures = ["PAGE.OutputFormats"]
returnType = "[]OutputFormat"
+++

## 这一页解决什么问题

一个页面可能同时输出 HTML、RSS、JSON 等多个版本，`.OutputFormats` 让你**在模板里发现这些版本并拿到它们的链接**。最典型的用法是在 `<head>` 里声明 RSS：

```go-html-template
{{ with .OutputFormats.Get "rss" }}
  <link rel="alternate" type="application/rss+xml" href="{{ .RelPermalink }}">
{{ end }}
```

注意区别：`.OutputFormats` 返回**切片**（可 `range`），`.OutputFormats.Get`、`.OutputFormats.Canonical` 返回**单个对象或 `nil`**。

## 什么时候用，什么时候别用

**该用**：

- 输出格式的发现与声明（`<link rel="alternate">`、`<link rel="canonical">`）；
- 在页面上放「订阅本页 RSS」的链接；
- 多输出格式站点（HTML + JSON/AMP）里判断当前页是否有某个格式。

**别用**：

- 想判断「当前渲染的是哪个输出格式」→ 上下文里有 `.OutputFormat`（单数，当前格式）可用；页面级切片不是干这个的；
- 只想拿页面 URL → 直接用 [`.RelPermalink`](/methods/page/relpermalink/)；
- 想配置有哪些输出格式 → 那是[输出格式配置](/configuration/output-formats/)的事。

## 用法

[输出格式（output format）](/quick-reference/glossary/output-format/)

`Page` 对象上的 `OutputFormats` 方法返回一组 `OutputFormat` 对象，每个对象对应该页面已启用的一种输出格式。详见[说明][]。

### 方法

在 `OutputFormats` 对象上使用这些方法。

`Canonical`
: **（0.154.4 新增）**
: （`page.OutputFormat`）返回当前页面的[规范输出格式](g)（如果已定义）。获取该对象后，可以使用它的任意[关联方法][]。

  ```go-html-template
  {{ with .Site.Home.OutputFormats.Canonical }}
    {{ .MediaType.Type }} → text/html
    {{ .MediaType.MainType }} → text
    {{ .MediaType.SubType }} → html
    {{ .Name }} → html
    {{ .Permalink }} → https://example.org/
    {{ .Rel }} → canonical
    {{ .RelPermalink }} → /
  {{ end }}
  ```

`Get`
: （`page.OutputFormat`）返回具有给定标识符的 `OutputFormat` 对象。获取该对象后，可以使用它的任意[关联方法][]。

  ```go-html-template
  {{ with .Site.Home.OutputFormats.Get "rss" }}
    {{ .MediaType.Type }} → application/rss+xml
    {{ .MediaType.MainType }} → application
    {{ .MediaType.SubType }} → rss
    {{ .Name }} → rss
    {{ .Permalink }} → https://example.org/index.xml
    {{ .Rel }} → alternate
    {{ .RelPermalink }} → /index.xml
  {{ end }}
  ```

### 示例

要渲染指向当前页面[规范输出格式](g)的 `link` 元素：

```go-html-template
{{ with .OutputFormats.Canonical }}
  {{ printf "<link rel=%q type=%q href=%q>" .Rel .MediaType.Type .Permalink | safeHTML }}
{{ end }}
```

要渲染指向当前页面 `rss` 输出格式的锚点元素：

```go-html-template
{{ with .OutputFormats.Get "rss" }}
  <a href="{{ .RelPermalink }}">RSS Feed</a>
{{ end }}
```

请参阅[链接到输出格式][]一节，以理解上述写法的意义。

## 完整示例：列出当前页启用的格式

测试站的配置（节选）：

```toml
[outputs]
home = ['HTML', 'RSS', 'JSON']
section = ['HTML', 'RSS']
page = ['HTML']

[outputFormats.JSON]
mediaType = 'application/json'
baseName = 'index'
```

模板：

```go-html-template {file="layouts/_default/single.html"}
<p>本页输出格式：{{ range .OutputFormats }}{{ .Name }} {{ end }}</p>
<p>canonical：
  {{ with .OutputFormats.Canonical }}{{ .Name }} | {{ .Rel }} | {{ .Permalink }}{{ else }}无{{ end }}
</p>
```

实测（Hugo 0.167.0）：

| 渲染的页面 | `range .OutputFormats` 得到 | `.OutputFormats.Canonical` | `.OutputFormats.Get "rss"` |
| --- | --- | --- | --- |
| `/posts/post-2/`（常规页面） | `html` | `html | canonical | https://example.org/posts/post-2/` | `nil`（页面未启用 RSS） |
| `/posts/`（section） | `html rss` | `html | canonical | https://example.org/posts/` | RSS 对象 |
| `/`（首页） | `html rss json` | `html | canonical | https://example.org/` | `rss | alternate | /index.xml` |

**你应当看到什么**：常规页面只有 `html`，因为配置里 `page = ['HTML']`；section 多了 `rss`；首页还多了 `json`。所以 `.OutputFormats.Get "rss"` 在内容页返回 `nil`——为内容页加 RSS 链接时**必须**用 `with` 判空。

## 返回值边界（实测）

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| `.OutputFormats` | `[]OutputFormat`（可能只有一项） | 否 |
| `.OutputFormats.Get "rss"`，页面未启用该格式 | `nil`（实测常规页面） | 否 |
| `.OutputFormats.Get` 传入不存在的名字 | `nil` | 否 |
| `.OutputFormats.Canonical` | 规范格式对象；未定义时 `nil` | 否 |
| 输出格式对象的字段 | `.Name`、`.Rel`、`.Permalink`、`.RelPermalink`、`.MediaType.Type` 等 | 否 |
| 直接取 `{{ .OutputFormats.Get "rss" }}` 后立刻 `.RelPermalink` | —— | 是：`nil pointer evaluating page.OutputFormat.RelPermalink` 一类错误 |
| 返回类型 | 切片 / 单个对象 / `nil` | 否 |

更多排查入口见[故障排查](/troubleshooting/)。

[associated methods]: /methods/output-format/
[details]: /configuration/output-formats/
[link to output formats]: /configuration/output-formats/#link-to-output-formats
