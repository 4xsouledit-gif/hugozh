+++
title = "PageNumber"
linkTitle = "PageNumber"
description = "返回当前分页器在分页器集合中的编号。"
date = 2026-10-02
weight = 80
source = "https://gohugo.io/methods/pager/pagenumber/"

[params.functions_and_methods]
signatures = ["PAGER.PageNumber"]
returnType = "int"
+++

使用 `PageNumber` 方法在分页器之间构建导航。

```go-html-template
{{ $pages := where site.RegularPages "Type" "posts" }}
{{ $paginator := .Paginate $pages }}

{{ range $paginator.Pages }}
  <h2><a href="{{ .RelPermalink }}">{{ .LinkTitle }}</a></h2>
{{ end }}

{{ with $paginator }}
  <ul>
    {{ range .Pagers }}
      <li><a href="{{ .URL }}">{{ .PageNumber }}</a></li>
    {{ end }}
  </ul>
{{ end }}
```
