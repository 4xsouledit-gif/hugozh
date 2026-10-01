+++
title = "urls.AbsURL"
linkTitle = "AbsURL"
description = "返回绝对 URL。"
date = 2026-10-02
weight = 30
source = "https://gohugo.io/functions/urls/absurl/"

[params.functions_and_methods]
signatures = ["urls.AbsURL INPUT"]
returnType = "string"
aliases = ["absURL"]
+++

使用多语言配置时，请改用 [`urls.AbsLangURL`][] 函数。返回的 URL 取决于：

- 输入是否以斜杠（`/`）开头
- 项目配置中的 `baseURL`

## 输入不以斜杠开头

如果输入不以斜杠开头，结果 URL 中的路径相对于项目配置里的 `baseURL`。

`baseURL = https://example.org/` 时

```go-html-template
{{ absURL "" }}          → https://example.org/
{{ absURL "articles" }}  → https://example.org/articles
{{ absURL "style.css" }} → https://example.org/style.css
```

`baseURL = https://example.org/docs/` 时

```go-html-template
{{ absURL "" }}          → https://example.org/docs/
{{ absURL "articles" }}  → https://example.org/docs/articles
{{ absURL "style.css" }} → https://example.org/docs/style.css
```

## 输入以斜杠开头

如果输入以斜杠开头，结果 URL 中的路径相对于项目配置里 `baseURL` 的协议加主机部分。

`baseURL = https://example.org/` 时

```go-html-template
{{ absURL "/" }}          → https://example.org/
{{ absURL "/articles" }}  → https://example.org/articles
{{ absURL "/style.css" }} → https://example.org/style.css
```

`baseURL = https://example.org/docs/` 时

```go-html-template
{{ absURL "/" }}          → https://example.org/
{{ absURL "/articles" }}  → https://example.org/articles
{{ absURL "/style.css" }} → https://example.org/style.css
```

> [!NOTE]
> 正如上面的例子所示，带前导斜杠的写法很少是你想要的，而且可能导致意外的结果。几乎在所有情况下都应省略前导斜杠。

[`urls.AbsLangURL`]: /functions/urls/abslangurl/
