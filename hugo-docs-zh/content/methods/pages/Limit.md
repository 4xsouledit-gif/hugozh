+++
title = "Limit"
linkTitle = "Limit"
description = "返回给定页面集合中的前 N 个页面。"
date = 2026-10-02
weight = 200
source = "https://gohugo.io/methods/pages/limit/"

[params.functions_and_methods]
signatures = ["PAGES.Limit N"]
returnType = "page.Pages"
+++

```go-html-template
{{ range .Pages.Limit 3 }}
  <h2><a href="{{ .RelPermalink }}">{{ .LinkTitle }}</a></h2>
{{ end }}
```
