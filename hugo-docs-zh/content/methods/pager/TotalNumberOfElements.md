+++
title = "TotalNumberOfElements"
linkTitle = "TotalNumberOfElements"
description = "返回分页器集合中的页面数量。"
date = 2026-10-02
weight = 130
source = "https://gohugo.io/methods/pager/totalnumberofelements/"

[params.functions_and_methods]
signatures = ["PAGER.TotalNumberOfElements"]
returnType = "int"
+++

```go-html-template
{{ $pages := where site.RegularPages "Type" "posts" }}
{{ $paginator := .Paginate $pages }}

{{ range $paginator.Pages }}
  <h2><a href="{{ .RelPermalink }}">{{ .LinkTitle }}</a></h2>
{{ end }}

{{ with $paginator }}
  {{ .TotalNumberOfElements }}
{{ end }}
```
