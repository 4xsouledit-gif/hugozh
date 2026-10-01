+++
title = "Pages"
linkTitle = "Pages"
description = "返回当前分页器中的页面。"
date = 2026-10-02
weight = 110
source = "https://gohugo.io/methods/pager/pages/"

[params.functions_and_methods]
signatures = ["PAGER.Pages"]
returnType = "page.Pages"
+++

```go-html-template
{{ $pages := where site.RegularPages "Type" "posts" }}
{{ $paginator := .Paginate $pages }}

{{ range $paginator.Pages }}
  <h2><a href="{{ .RelPermalink }}">{{ .LinkTitle }}</a></h2>
{{ end }}

{{ partial "pagination.html" . }}
```
