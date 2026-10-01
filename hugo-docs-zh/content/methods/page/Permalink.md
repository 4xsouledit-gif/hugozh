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
