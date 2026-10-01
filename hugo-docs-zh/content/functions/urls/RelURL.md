+++
title = "urls.RelURL"
linkTitle = "RelURL"
description = "返回相对 URL。"
date = 2026-10-02
weight = 120
source = "https://gohugo.io/functions/urls/relurl/"

[params.functions_and_methods]
signatures = ["urls.RelURL INPUT"]
returnType = "string"
aliases = ["relURL"]
+++

使用多语言配置时，请改用 [`urls.RelLangURL`][] 函数。返回的 URL 取决于：

- 输入是否以斜杠（`/`）开头
- 项目配置中的 `baseURL`

## 输入不以斜杠开头

如果输入不以斜杠开头，结果 URL 相对于项目配置里的 `baseURL`。

`baseURL = https://example.org/` 时

```go-html-template
{{ relURL "" }}                         → /
{{ relURL "articles" }}                 → /articles
{{ relURL "style.css" }}                → /style.css
{{ relURL "https://example.org" }}      → https://example.org
{{ relURL "https://example.org/" }}     → /
{{ relURL "https://www.example.org" }}  → https://www.example.org
{{ relURL "https://www.example.org/" }} → https://www.example.org/
```

`baseURL = https://example.org/docs/` 时

```go-html-template
{{ relURL "" }}                           → /docs/
{{ relURL "articles" }}                   → /docs/articles
{{ relURL "style.css" }}                  → /docs/style.css
{{ relURL "https://example.org" }}        → https://example.org
{{ relURL "https://example.org/" }}       → https://example.org/
{{ relURL "https://example.org/docs" }}   → https://example.org/docs
{{ relURL "https://example.org/docs/" }}  → /docs
{{ relURL "https://www.example.org" }}    → https://www.example.org
{{ relURL "https://www.example.org/" }}   → https://www.example.org/
```

## 输入以斜杠开头

如果输入以斜杠开头，结果 URL 相对于项目配置里 `baseURL` 的协议加主机部分。

`baseURL = https://example.org/` 时

```go-html-template
{{ relURL "/" }}          → /
{{ relURL "/articles" }}  → /articles
{{ relURL "/style.css" }} → /style.css
```

`baseURL = https://example.org/docs/` 时

```go-html-template
{{ relURL "/" }}          → /
{{ relURL "/articles" }}  → /articles
{{ relURL "/style.css" }} → /style.css
```

> [!NOTE]
> 正如上面的例子所示，带前导斜杠的写法很少是你想要的，而且可能导致意外的结果。几乎在所有情况下都应省略前导斜杠。

[`urls.RelLangURL`]: /functions/urls/rellangurl/
