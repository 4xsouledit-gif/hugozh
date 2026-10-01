+++
title = "Title"
linkTitle = "Title"
description = "返回给定菜单条目的 `title` 属性。"
date = 2026-10-02
weight = 130
source = "https://gohugo.io/methods/menu-entry/title/"

[params.functions_and_methods]
signatures = ["MENUENTRY.Title"]
returnType = "string"
+++

`Title` 方法返回给定菜单条目的 `title` 属性。如果未定义 `title`，且该菜单条目解析到某个页面，则 `Title` 返回该页面的 [`Title`][]。

```go-html-template
<ul>
  {{ range .Site.Menus.main }}
    <li><a href="{{ .URL }}" title="{{ .Title }}>{{ .Name }}</a></li>
  {{ end }}
</ul>
```

[`Title`]: /methods/page/title/
