+++
title = "IsMenuCurrent"
linkTitle = "IsMenuCurrent"
description = "报告给定 Page 对象是否匹配指定菜单中某个菜单项所关联的 Page 对象。"
date = 2026-10-02
weight = 320
source = "https://gohugo.io/methods/page/ismenucurrent/"
aliases = ["/functions/ismenucurrent"]

[params.functions_and_methods]
signatures = ["PAGE.IsMenuCurrent MENU MENUENTRY"]
returnType = "bool"
+++

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
