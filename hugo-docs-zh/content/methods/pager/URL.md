+++
title = "URL"
linkTitle = "URL"
description = "返回当前分页器相对于站点根目录的 URL。"
date = 2026-10-02
weight = 150
source = "https://gohugo.io/methods/pager/url/"

[params.functions_and_methods]
signatures = ["PAGER.URL"]
returnType = "string"
+++

使用 `URL` 方法在分页器之间构建导航。

```go-html-template
{{ $pages := where site.RegularPages "Type" "posts" }}
{{ $paginator := .Paginate $pages }}

{{ range $paginator.Pages }}
  <h2><a href="{{ .RelPermalink }}">{{ .LinkTitle }}</a></h2>
{{ end }}

{{ with $paginator }}
  <ul>
    {{ with .First }}
      <li><a href="{{ .URL }}">First</a></li>
    {{ end }}
    {{ with .Prev }}
      <li><a href="{{ .URL }}">Previous</a></li>
    {{ end }}
    {{ with .Next }}
      <li><a href="{{ .URL }}">Next</a></li>
    {{ end }}
    {{ with .Last }}
      <li><a href="{{ .URL }}">Last</a></li>
    {{ end }}
  </ul>
{{ end }}
```
