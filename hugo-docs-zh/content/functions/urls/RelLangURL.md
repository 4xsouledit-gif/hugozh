+++
title = "urls.RelLangURL"
linkTitle = "RelLangURL"
description = "返回带语言前缀（如果有）的相对 URL。"
date = 2026-10-02
weight = 100
source = "https://gohugo.io/functions/urls/rellangurl/"

[params.functions_and_methods]
signatures = ["urls.RelLangURL INPUT"]
returnType = "string"
aliases = ["relLangURL"]
+++

单语言与多语言配置都可以使用该函数。返回的 URL 取决于：

- 输入是否以斜杠（`/`）开头
- 项目配置中的 `baseURL`
- 语言前缀（如果有）

下文示例使用这份项目配置：

```toml
defaultContentLanguage = 'en'
defaultContentLanguageInSubdir = true
[languages.en]
weight = 1
[languages.es]
weight = 2
```

## 输入不以斜杠开头

如果输入不以斜杠开头，结果 URL 相对于项目配置里的 `baseURL`。

以 `baseURL = https://example.org/` 渲染 `en` 站点时

```go-html-template
{{ relLangURL "" }}                         → /en/
{{ relLangURL "articles" }}                 → /en/articles
{{ relLangURL "style.css" }}                → /en/style.css
{{ relLangURL "https://example.org" }}      → https://example.org
{{ relLangURL "https://example.org/" }}     → /en
{{ relLangURL "https://www.example.org" }}  → https://www.example.org
{{ relLangURL "https://www.example.org/" }} → https://www.example.org/
```

以 `baseURL = https://example.org/docs/` 渲染 `en` 站点时

```go-html-template
{{ relLangURL "" }}                           → /docs/en/
{{ relLangURL "articles" }}                   → /docs/en/articles
{{ relLangURL "style.css" }}                  → /docs/en/style.css
{{ relLangURL "https://example.org" }}        → https://example.org
{{ relLangURL "https://example.org/" }}       → https://example.org/
{{ relLangURL "https://example.org/docs" }}   → https://example.org/docs
{{ relLangURL "https://example.org/docs/" }}  → /docs/en
{{ relLangURL "https://www.example.org" }}    → https://www.example.org
{{ relLangURL "https://www.example.org/" }}   → https://www.example.org/
```

## 输入以斜杠开头

如果输入以斜杠开头，结果 URL 相对于项目配置里 `baseURL` 的协议加主机部分。

以 `baseURL = https://example.org/` 渲染 `en` 站点时

```go-html-template
{{ relLangURL "/" }}          → /en/
{{ relLangURL "/articles" }}  → /en/articles
{{ relLangURL "/style.css" }} → /en/style.css
```

以 `baseURL = https://example.org/docs/` 渲染 `en` 站点时

```go-html-template
{{ relLangURL "/" }}          → /en/
{{ relLangURL "/articles" }}  → /en/articles
{{ relLangURL "/style.css" }} → /en/style.css
```

> [!NOTE]
> 正如上面的例子所示，带前导斜杠的写法很少是你想要的，而且可能导致意外的结果。几乎在所有情况下都应省略前导斜杠。
