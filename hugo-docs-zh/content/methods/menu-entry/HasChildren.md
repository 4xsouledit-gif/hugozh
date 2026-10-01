+++
title = "HasChildren"
linkTitle = "HasChildren"
description = "报告给定菜单条目是否有子菜单条目。"
date = 2026-10-02
weight = 20
source = "https://gohugo.io/methods/menu-entry/haschildren/"

[params.functions_and_methods]
signatures = ["MENUENTRY.HasChildren"]
returnType = "bool"
+++

渲染嵌套菜单时请使用 `HasChildren` 方法。

项目配置如下：

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

模板如下：

```go-html-template
<ul>
  {{ range .Site.Menus.main }}
    <li>
      <a href="{{ .URL }}">{{ .Name }}</a>
      {{ if .HasChildren }}
        <ul>
          {{ range .Children }}
            <li><a href="{{ .URL }}">{{ .Name }}</a></li>
          {{ end }}
        </ul>
      {{ end }}
    </li>
  {{ end }}
</ul>
```

Hugo 渲染出如下 HTML：

```html
<ul>
  <li>
    <a href="/products/">Products</a>
    <ul>
      <li><a href="/products/product-1/">Product 1</a></li>
      <li><a href="/products/product-2/">Product 2</a></li>
    </ul>
  </li>
</ul>
```
