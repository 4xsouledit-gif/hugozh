+++
title = "ByName"
linkTitle = "ByName"
description = "返回给定菜单，其条目按 name 排序。"
date = 2026-10-02
weight = 10
source = "https://gohugo.io/methods/menu/byname/"

[params.functions_and_methods]
signatures = ["MENU.ByName"]
returnType = "navigation.Menu"
+++

`Sort` 方法返回给定菜单，其条目按 `name` 排序。

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

要按 `name` 排序条目：

```go-html-template
<ul>
  {{ range .Site.Menus.main.ByName }}
    <li><a href="{{ .URL }}">{{ .Name }}</a></li>
  {{ end }}
</ul>
```

Hugo 渲染结果为：

```html
<ul>
  <li><a href="/about/">About</a></li>
  <li><a href="/contact">Contact</a></li>
  <li><a href="/services/">Services</a></li>
</ul>
```

也可以使用 [`sort`][] 函数对菜单条目排序。例如按 `name` 降序排序：

```go-html-template
<ul>
  {{ range sort .Site.Menus.main "Name" "desc" }}
    <li><a href="{{ .URL }}">{{ .Name }}</a></li>
  {{ end }}
</ul>
```

对菜单条目使用 sort 函数时，可指定以下任意键：`Identifier`、`Name`、`Parent`、`Post`、`Pre`、`Title`、`URL` 或 `Weight`。

[`sort`]: /functions/collections/sort/
