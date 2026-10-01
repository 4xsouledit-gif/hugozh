+++
title = "GroupByParam"
linkTitle = "GroupByParam"
description = "返回给定页面集合按指定参数升序分组后的结果。"
date = 2026-10-02
weight = 150
source = "https://gohugo.io/methods/pages/groupbyparam/"

[params.functions_and_methods]
signatures = ["PAGES.GroupByParam PARAM [SORT]"]
returnType = "page.PagesGroup"
+++

可选的排序顺序用 `asc` 指定升序，或用 `desc` 指定降序。

```go-html-template
{{ range .Pages.GroupByParam "color" }}
  <p>{{ .Key | title }}</p>
  <ul>
    {{ range .Pages }}
      <li><a href="{{ .RelPermalink }}">{{ .LinkTitle }}</a></li>
    {{ end }}
  </ul>
{{ end }}
```

要把各组改为降序排列：

```go-html-template
{{ range .Pages.GroupByParam "color" "desc" }}
  <p>{{ .Key | title }}</p>
  <ul>
    {{ range .Pages }}
      <li><a href="{{ .RelPermalink }}">{{ .LinkTitle }}</a></li>
    {{ end }}
  </ul>
{{ end }}
```
