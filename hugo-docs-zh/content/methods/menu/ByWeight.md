+++
title = "ByWeight"
linkTitle = "ByWeight"
description = "返回给定菜单，其条目先按 weight、再按 name、最后按 identifier 排序。"
date = 2026-10-02
weight = 20
source = "https://gohugo.io/methods/menu/byweight/"

[params.functions_and_methods]
signatures = ["MENU.ByWeight"]
returnType = "navigation.Menu"
+++

`ByWeight` 方法返回给定菜单，其条目先按 [`weight`](g)、再按 `name`、最后按 `identifier` 排序。这是默认的排序方式。

请看下面的菜单定义：

```toml
[[menus.main]]
identifier = 'about'
name = 'About'
pageRef = '/about'
weight = 20

[[menus.main]]
identifier = 'services'
name = 'Services'
pageRef = '/services'
weight = 10

[[menus.main]]
identifier = 'contact'
name = 'Contact'
pageRef = '/contact'
weight = 30
```

要按 `weight`、再按 `name`、最后按 `identifier` 排序条目：

```go-html-template
<ul>
  {{ range .Site.Menus.main.ByWeight }}
    <li><a href="{{ .URL }}">{{ .Name }}</a></li>
  {{ end }}
</ul>
```

Hugo 渲染结果为：

```html
<ul>
  <li><a href="/services/">Services</a></li>
  <li><a href="/about/">About</a></li>
  <li><a href="/contact">Contact</a></li>
</ul>
```

> [!NOTE]
> 在上面的菜单定义中，只有当两个或更多菜单条目同名，或需要使用翻译表本地化名称时，才必须提供 `identifier` 属性。

也可以使用 [`sort`][] 函数对菜单条目排序。例如按 `weight` 降序排序：

```go-html-template
<ul>
  {{ range sort .Site.Menus.main "Weight" "desc" }}
    <li><a href="{{ .URL }}">{{ .Name }}</a></li>
  {{ end }}
</ul>
```

对菜单条目使用 sort 函数时，可指定以下任意键：`Identifier`、`Name`、`Parent`、`Post`、`Pre`、`Title`、`URL` 或 `Weight`。

[`sort`]: /functions/collections/sort/
