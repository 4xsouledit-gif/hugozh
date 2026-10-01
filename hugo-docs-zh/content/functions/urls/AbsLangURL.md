+++
title = "urls.AbsLangURL"
linkTitle = "AbsLangURL"
description = "返回带语言前缀（如果有）的绝对 URL。"
date = 2026-10-02
weight = 20
source = "https://gohugo.io/functions/urls/abslangurl/"

[params.functions_and_methods]
signatures = ["urls.AbsLangURL INPUT"]
returnType = "string"
aliases = ["absLangURL"]
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

如果输入不以斜杠开头，结果 URL 中的路径相对于项目配置里的 `baseURL`。

以 `baseURL = https://example.org/` 渲染 `en` 站点时

```go-html-template
{{ absLangURL "" }}           → https://example.org/en/
{{ absLangURL "articles" }}   → https://example.org/en/articles
{{ absLangURL "style.css" }}  → https://example.org/en/style.css
```

以 `baseURL = https://example.org/docs/` 渲染 `en` 站点时

```go-html-template
{{ absLangURL "" }}           → https://example.org/docs/en/
{{ absLangURL "articles" }}   → https://example.org/docs/en/articles
{{ absLangURL "style.css" }}  → https://example.org/docs/en/style.css
```

## 输入以斜杠开头

如果输入以斜杠开头，结果 URL 中的路径相对于项目配置里 `baseURL` 的协议加主机部分。

以 `baseURL = https://example.org/` 渲染 `en` 站点时

```go-html-template
{{ absLangURL "/" }}          → https://example.org/en/
{{ absLangURL "/articles" }}  → https://example.org/en/articles
{{ absLangURL "/style.css" }} → https://example.org/en/style.css
```

以 `baseURL = https://example.org/docs/` 渲染 `en` 站点时

```go-html-template
{{ absLangURL "/" }}          → https://example.org/en/
{{ absLangURL "/articles" }}  → https://example.org/en/articles
{{ absLangURL "/style.css" }} → https://example.org/en/style.css
```

> [!NOTE]
> 正如上面的例子所示，带前导斜杠的写法很少是你想要的，而且可能导致意外的结果。几乎在所有情况下都应省略前导斜杠。
