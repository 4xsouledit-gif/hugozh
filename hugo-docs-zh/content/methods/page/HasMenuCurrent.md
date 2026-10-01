+++
title = "HasMenuCurrent"
linkTitle = "HasMenuCurrent"
description = "报告给定 Page 对象是否匹配某个菜单项下的子菜单项所关联的 Page 对象。"
date = 2026-10-02
weight = 240
source = "https://gohugo.io/methods/page/hasmenucurrent/"
aliases = ["/functions/hasmenucurrent"]

[params.functions_and_methods]
signatures = ["PAGE.HasMenuCurrent MENU MENUENTRY"]
returnType = "bool"
+++

如果菜单项关联的 `Page` 对象是一个 section，那么对该 section 的任何后代页面，这个方法同样返回 `true`。

```go-html-template
{{ $currentPage := . }}
{{ range site.Menus.main }}
  {{ if $currentPage.IsMenuCurrent .Menu . }}
    <a class="active" aria-current="page" href="{{ .URL }}">{{ .Name }}</a>
  {{ else if $currentPage.HasMenuCurrent .Menu . }}
    <a class="ancestor" aria-current="true" href="{{ .URL }}">{{ .Name }}</a>
  {{ else }}
    <a href="{{ .URL }}">{{ .Name }}</a>
  {{ end }}
{{ end }}
```

完整示例见[菜单模板][]。

> [!NOTE]
> 使用这个方法时，你要么在前置元数据中定义菜单项，要么在项目配置中定义菜单项时指定 `pageRef` 属性。

[菜单模板]: /templates/menu/#example
