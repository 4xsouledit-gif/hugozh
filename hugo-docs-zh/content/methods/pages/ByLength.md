+++
title = "ByLength"
linkTitle = "ByLength"
description = "返回给定页面集合按内容长度升序排序后的结果。"
date = 2026-10-02
weight = 50
source = "https://gohugo.io/methods/pages/bylength/"

[params.functions_and_methods]
signatures = ["PAGES.ByLength"]
returnType = "page.Pages"
+++

```go-html-template
{{ range .Pages.ByLength }}
  <h2><a href="{{ .RelPermalink }}">{{ .LinkTitle }}</a></h2>
{{ end }}
```

要改为降序排列：

```go-html-template
{{ range .Pages.ByLength.Reverse }}
  <h2><a href="{{ .RelPermalink }}">{{ .LinkTitle }}</a></h2>
{{ end }}
```
