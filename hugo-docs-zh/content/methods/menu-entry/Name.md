+++
title = "Name"
linkTitle = "Name"
description = "返回给定菜单条目的 `name` 属性。"
date = 2026-10-02
weight = 60
source = "https://gohugo.io/methods/menu-entry/name/"

[params.functions_and_methods]
signatures = ["MENUENTRY.Name"]
returnType = "string"
+++

如果[自动][]定义菜单条目，`Name` 方法返回该页面的 [`LinkTitle`][]，若不存在则回退到其 [`Title`][]。

如果在[前置元数据][front matter]或[项目配置][]中定义菜单条目，`Name` 方法返回给定菜单条目的 `name` 属性。如果未定义 `name`，且该菜单条目解析到某个页面，则 `Name` 返回该页面的 [`LinkTitle`][]，若不存在则回退到其 [`Title`][]。

```go-html-template
<ul>
  {{ range .Site.Menus.main }}
    <li><a href="{{ .URL }}">{{ .Name }}</a></li>
  {{ end }}
</ul>
```

[`LinkTitle`]: /methods/page/linktitle/
[`Title`]: /methods/page/title/
[自动]: /content-management/menus/#define-automatically
[front matter]: /content-management/menus/#define-in-front-matter
[项目配置]: /content-management/menus/#define-in-project-configuration
