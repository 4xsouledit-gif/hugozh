+++
title = "Reverse"
linkTitle = "Reverse"
description = "返回给定菜单，并反转其条目的排序顺序。"
date = 2026-10-02
weight = 40
source = "https://gohugo.io/methods/menu/reverse/"

[params.functions_and_methods]
signatures = ["MENU.Reverse"]
returnType = "navigation.Menu"
+++

`Reverse` 方法返回给定菜单，并反转其条目的排序顺序。

请看下面的菜单定义：

```toml
[[menus.main]]
name = 'Services'
pageRef = '/services'
weight = 10

[[menus.main]]
name = 'About'
pageRef = '/about'
weight = 20

[[menus.main]]
name = 'Contact'
pageRef = '/contact'
weight = 30
```

要按 name 降序排序条目：

```go-html-template
<ul>
  {{ range .Site.Menus.main.ByName.Reverse }}
    <li><a href="{{ .URL }}">{{ .Name }}</a></li>
  {{ end }}
</ul>
```

Hugo 渲染结果为：

```html
<ul>
  <li><a href="/services/">Services</a></li>
  <li><a href="/contact">Contact</a></li>
  <li><a href="/about/">About</a></li>
</ul>
```
