+++
title = "ByTitle"
linkTitle = "ByTitle"
description = "返回给定页面集合按标题升序排序后的结果。"
date = 2026-10-02
weight = 90
source = "https://gohugo.io/methods/pages/bytitle/"

[params.functions_and_methods]
signatures = ["PAGES.ByTitle"]
returnType = "page.Pages"
+++

```go-html-template
{{ range .Pages.ByTitle }}
  <h2><a href="{{ .RelPermalink }}">{{ .Title }}</a></h2>
{{ end }}
```

要改为降序排列：

```go-html-template
{{ range .Pages.ByTitle.Reverse }}
  <h2><a href="{{ .RelPermalink }}">{{ .Title }}</a></h2>
{{ end }}
```
