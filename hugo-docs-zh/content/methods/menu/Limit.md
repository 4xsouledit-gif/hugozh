+++
title = "Limit"
linkTitle = "Limit"
description = "返回给定菜单，并限制为前 N 个条目。"
date = 2026-10-02
weight = 30
source = "https://gohugo.io/methods/menu/limit/"

[params.functions_and_methods]
signatures = ["MENU.Limit N"]
returnType = "navigation.Menu"
+++

`Limit` 方法返回给定菜单，并限制为前 N 个条目。

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

要按 name 排序条目，并限制为前 2 个：

```go-html-template
<ul>
  {{ range .Site.Menus.main.ByName.Limit 2 }}
    <li><a href="{{ .URL }}">{{ .Name }}</a></li>
  {{ end }}
</ul>
```

Hugo 渲染结果为：

```html
<ul>
  <li><a href="/about/">About</a></li>
  <li><a href="/contact">Contact</a></li>
</ul>
```
