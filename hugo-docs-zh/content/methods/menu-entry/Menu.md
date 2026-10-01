+++
title = "Menu"
linkTitle = "Menu"
description = "返回包含给定菜单条目的菜单标识符。"
date = 2026-10-02
weight = 50
source = "https://gohugo.io/methods/menu-entry/menu/"

[params.functions_and_methods]
signatures = ["MENUENTRY.Menu"]
returnType = "string"
+++

```go-html-template
{{ range .Site.Menus.main }}
  {{ .Menu }} → main
{{ end }}
```

把该方法与 `Page` 对象上的 [`IsMenuCurrent`][] 和 [`HasMenuCurrent`][] 方法配合使用，可以为渲染出的条目设置 "active" 和 "ancestor" 类。参见[这个示例][]。

[`HasMenuCurrent`]: /methods/page/hasmenucurrent/
[`IsMenuCurrent`]: /methods/page/ismenucurrent/
[这个示例]: /templates/menu/#example
