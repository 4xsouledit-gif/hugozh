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
