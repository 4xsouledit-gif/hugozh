+++
title = "PageGroups"
linkTitle = "PageGroups"
description = "返回当前分页器中的页面分组。"
date = 2026-10-02
weight = 70
source = "https://gohugo.io/methods/pager/pagegroups/"

[params.functions_and_methods]
signatures = ["PAGER.PageGroups"]
returnType = "page.PagesGroup"
+++

把 `PageGroups` 方法与任意[分组方法][grouping methods]配合使用。

```go-html-template
{{ $pages := where site.RegularPages "Type" "posts" }}
{{ $paginator := .Paginate ($pages.GroupByDate "Jan 2006") }}

{{ range $paginator.PageGroups }}
  <h2>{{ .Key }}</h2>
  {{ range .Pages }}
    <h3><a href="{{ .RelPermalink }}">{{ .LinkTitle }}</a></h3>
  {{ end }}
{{ end }}

{{ partial "pagination.html" . }}
```

[grouping methods]: /quick-reference/page-collections/#group
