+++
title = "URL"
linkTitle = "URL"
description = "返回与给定菜单条目关联的页面的相对永久链接，否则返回其 `url` 属性。"
date = 2026-10-02
weight = 140
source = "https://gohugo.io/methods/menu-entry/url/"

[params.functions_and_methods]
signatures = ["MENUENTRY.URL"]
returnType = "string"
+++

对于与页面关联的菜单条目，`URL` 方法返回该页面的 [`RelPermalink`][]；否则返回条目的 `url` 属性。

```go-html-template
<ul>
  {{ range .Site.Menus.main }}
    <li><a href="{{ .URL }}">{{ .Name }}</a></li>
  {{ end }}
</ul>
```

[`RelPermalink`]: /methods/page/relpermalink/
