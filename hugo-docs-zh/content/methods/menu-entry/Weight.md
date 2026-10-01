+++
title = "Weight"
linkTitle = "Weight"
description = "返回给定菜单条目的 `weight` 属性。"
date = 2026-10-02
weight = 150
source = "https://gohugo.io/methods/menu-entry/weight/"

[params.functions_and_methods]
signatures = ["MENUENTRY.Weight"]
returnType = "int"
+++

如果[自动][]定义菜单条目，`Weight` 方法返回该页面的 [`Weight`][]。

如果在[前置元数据][front matter]或[项目配置][]中定义菜单条目，`Weight` 方法返回 `weight` 属性，若不存在则回退到该页面的 `Weight`。

在这个刻意构造的示例中，我们按 weight 限制菜单条目的数量：

```go-html-template
<ul>
  {{ range .Site.Menus.main }}
    {{ if le .Weight 42 }}
      <li><a href="{{ .URL }}">{{ .Name }}</a></li>
    {{ end }}
  {{ end }}
</ul>
```

[`Weight`]: /methods/page/weight/
[自动]: /content-management/menus/#define-automatically
[front matter]: /content-management/menus/#define-in-front-matter
[项目配置]: /content-management/menus/#define-in-project-configuration
