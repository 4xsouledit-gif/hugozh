+++
title = "Parent"
linkTitle = "Parent"
description = "返回给定菜单条目的 `parent` 属性。"
date = 2026-10-02
weight = 100
source = "https://gohugo.io/methods/menu-entry/parent/"

[params.functions_and_methods]
signatures = ["MENUENTRY.Parent"]
returnType = "string"
+++

菜单定义如下：

```toml
[[menus.main]]
name = 'Products'
pageRef = '/product'
weight = 10

[[menus.main]]
name = 'Product 1'
pageRef = '/products/product-1'
parent = 'Products'
weight = 1

[[menus.main]]
name = 'Product 2'
pageRef = '/products/product-2'
parent = 'Products'
weight = 2
```

下面的模板渲染嵌套菜单，在每个子条目旁列出其 `parent` 属性：

```go-html-template
<ul>
  {{ range .Site.Menus.main }}
    <li>
      <a href="{{ .URL }}">{{ .Name }}</a>
      {{ if .HasChildren }}
        <ul>
          {{ range .Children }}
            <li><a href="{{ .URL }}">{{ .Name }}</a> ({{ .Parent }})</li>
          {{ end }}
        </ul>
      {{ end }}
    </li>
  {{ end }}
</ul>
```
