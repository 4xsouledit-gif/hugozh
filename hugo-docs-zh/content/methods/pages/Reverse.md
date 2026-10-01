+++
title = "Reverse"
linkTitle = "Reverse"
description = "返回给定页面集合的反序结果。"
date = 2026-10-02
weight = 240
source = "https://gohugo.io/methods/pages/reverse/"

[params.functions_and_methods]
signatures = ["PAGES.Reverse"]
returnType = "page.Pages"
+++

```go-html-template
{{ range .Pages.ByDate.Reverse }}
  <h2><a href="{{ .RelPermalink }}">{{ .LinkTitle }}</a></h2>
{{ end }}
```
