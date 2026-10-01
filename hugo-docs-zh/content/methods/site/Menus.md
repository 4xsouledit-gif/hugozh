+++
title = "Menus"
linkTitle = "Menus"
description = "返回给定站点的菜单对象集合。"
date = 2026-10-02
weight = 160
source = "https://gohugo.io/methods/site/menus/"

[params.functions_and_methods]
signatures = ["SITE.Menus"]
returnType = "navigation.Menus"
+++

`Site` 对象上的 `Menus` 方法返回菜单的集合，其中每个菜单包含一个或多个条目，条目可以是平铺的，也可以是嵌套的。每个条目指向站点内的某个页面，或指向外部资源。

> [!NOTE]
> 菜单可以通过多种方式定义和本地化。完整说明和示例请参见[菜单][]一节。

一个站点可以有多个菜单。例如一个主菜单和一个页脚菜单：

```toml
[[menus.main]]
name = 'Home'
pageRef = '/'
weight = 10

[[menus.main]]
name = 'Books'
pageRef = '/books'
weight = 20

[[menus.main]]
name = 'Films'
pageRef = '/films'
weight = 30

[[menus.footer]]
name = 'Legal'
pageRef = '/legal'
weight = 10

[[menus.footer]]
name = 'Privacy'
pageRef = '/privacy'
weight = 20
```

这个模板渲染主菜单：

```go-html-template
{{ with site.Menus.main }}
  <nav class="menu">
    {{ range . }}
      {{ if $.IsMenuCurrent .Menu . }}
        <a class="active" aria-current="page" href="{{ .URL }}">{{ .Name }}</a>
      {{ else }}
        <a href="{{ .URL }}">{{ .Name }}</a>
      {{ end }}
    {{ end }}
  </nav>
{{ end }}
```

查看首页时，结果是：

```html
<nav class="menu">
  <a class="active" aria-current="page" href="/">Home</a>
  <a href="/books/">Books</a>
  <a href="/films/">Films</a>
</nav>
```

查看 `books` 页面时，结果是：

```html
<nav class="menu">
  <a href="/">Home</a>
  <a class="active" aria-current="page" href="/books/">Books</a>
  <a href="/films/">Films</a>
</nav>
```

你通常会用_局部模板_来渲染菜单。由于活动菜单条目在每个页面上都不同，请用 [`partial`][] 函数调用模板，不要用 [`partialCached`][] 函数。

上面的示例很简单。更多信息请参见[菜单模板][]一节。

[`partialCached`]: /functions/partials/includecached/
[`partial`]: /functions/partials/include/
[菜单模板]: /templates/menu/
[菜单]: /content-management/menus/
