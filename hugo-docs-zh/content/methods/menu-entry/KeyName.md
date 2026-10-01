+++
title = "KeyName"
linkTitle = "KeyName"
description = "返回给定菜单条目的 `identifier` 属性，若不存在则回退到其 `name` 属性。"
date = 2026-10-02
weight = 40
source = "https://gohugo.io/methods/menu-entry/keyname/"

[params.functions_and_methods]
signatures = ["MENUENTRY.KeyName"]
returnType = "string"
+++

在下面的菜单定义中，第二个条目没有 `identifier`，因此 `Identifier` 方法改为返回其 `name` 属性：

```toml
[[menus.main]]
identifier = 'about'
name = 'About'
pageRef = '/about'
weight = 10

[[menus.main]]
name = 'Contact'
pageRef = '/contact'
weight = 20
```

下面的示例在多语言项目中查询翻译表时使用了 `KeyName` 方法，若翻译表中不存在匹配的键，则回退到 `name` 属性：

```go-html-template
<ul>
  {{ range .Site.Menus.main }}
    <li><a href="{{ .URL }}">{{ or (T (.KeyName | lower)) .Name }}</a></li>
  {{ end }}
</ul>
```

在上面的示例中，需要把 `.KeyName` 返回的值传给 [`strings.ToLower`][] 函数，因为翻译表中的键是小写的。

[`strings.ToLower`]: /functions/strings/tolower/
