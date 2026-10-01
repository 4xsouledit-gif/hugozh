+++
title = "GroupBy"
linkTitle = "GroupBy"
description = "返回给定页面集合按指定字段升序分组后的结果。"
date = 2026-10-02
weight = 110
source = "https://gohugo.io/methods/pages/groupby/"

[params.functions_and_methods]
signatures = ["PAGES.GroupBy FIELD [SORT]"]
returnType = "page.PagesGroup"
+++

可选的排序顺序用 `asc` 指定升序，或用 `desc` 指定降序。

```go-html-template
{{ range .Pages.GroupBy "Section" }}
  <p>{{ .Key }}</p>
  <ul>
    {{ range .Pages }}
      <li><a href="{{ .RelPermalink }}">{{ .LinkTitle }}</a></li>
    {{ end }}
  </ul>
{{ end }}
```

要把各组改为降序排列：

```go-html-template
{{ range .Pages.GroupBy "Section" "desc" }}
  <p>{{ .Key }}</p>
  <ul>
    {{ range .Pages }}
      <li><a href="{{ .RelPermalink }}">{{ .LinkTitle }}</a></li>
    {{ end }}
  </ul>
{{ end }}
```
