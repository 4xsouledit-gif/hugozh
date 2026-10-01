+++
title = "PagerSize"
linkTitle = "PagerSize"
description = "返回每个分页器的页面数量。"
date = 2026-10-02
weight = 100
source = "https://gohugo.io/methods/pager/pagersize/"
aliases = ["/methods/pager/pagesize/"]

[params.functions_and_methods]
signatures = ["PAGER.PagerSize"]
returnType = "int"
+++

每个分页器的页面数量由传给 [`Paginate`][] 方法的可选第二个参数决定；如果未传入，则回退到[项目配置][project configuration]中定义的 `pagerSize`。

```go-html-template
{{ $pages := where site.RegularPages "Type" "posts" }}
{{ $paginator := .Paginate $pages }}

{{ range $paginator.Pages }}
  <h2><a href="{{ .RelPermalink }}">{{ .LinkTitle }}</a></h2>
{{ end }}

{{ with $paginator }}
  {{ .PagerSize }}
{{ end }}
```

[`Paginate`]: /methods/page/paginate/
[project configuration]: /templates/pagination/#configuration
