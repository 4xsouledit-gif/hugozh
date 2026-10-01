+++
title = "NumberOfElements"
linkTitle = "NumberOfElements"
description = "返回当前分页器中的页面数量。"
date = 2026-10-02
weight = 60
source = "https://gohugo.io/methods/pager/numberofelements/"

[params.functions_and_methods]
signatures = ["PAGER.NumberOfElements"]
returnType = "int"
+++

```go-html-template
{{ $pages := where site.RegularPages "Type" "posts" }}
{{ $paginator := .Paginate $pages }}

{{ range $paginator.Pages }}
  <h2><a href="{{ .RelPermalink }}">{{ .LinkTitle }}</a></h2>
{{ end }}

{{ with $paginator }}
  {{ .NumberOfElements }}
{{ end }}
```
