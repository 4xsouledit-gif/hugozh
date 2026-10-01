+++
title = "Identifier"
linkTitle = "Identifier"
description = "返回给定菜单条目的 `identifier` 属性。"
date = 2026-10-02
weight = 30
source = "https://gohugo.io/methods/menu-entry/identifier/"

[params.functions_and_methods]
signatures = ["MENUENTRY.Identifier"]
returnType = "string"
+++

`Identifier` 方法返回菜单条目的 `identifier` 属性。如果[自动][]定义菜单条目，它返回该页面所属的 section（内容区块）。

```toml
[[menus.main]]
identifier = 'about'
name = 'About'
pageRef = '/about'
weight = 10

[[menus.main]]
identifier = 'contact'
name = 'Contact'
pageRef = '/contact'
weight = 20
```

下面的示例在多语言项目中查询翻译表时使用了 `Identifier` 方法，若翻译表中不存在匹配的键，则回退到 `name` 属性：

```go-html-template
<ul>
  {{ range .Site.Menus.main }}
    <li><a href="{{ .URL }}">{{ or (T .Identifier) .Name }}</a></li>
  {{ end }}
</ul>
```

> [!NOTE]
> 在上面的菜单定义中，只有当两个或更多菜单条目同名，或需要使用翻译表本地化名称时，才必须提供 `identifier` 属性。

[自动]: /content-management/menus/#define-automatically
