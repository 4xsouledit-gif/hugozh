+++
title = "PageRef"
linkTitle = "PageRef"
description = "返回给定菜单条目的 `pageRef` 属性。"
date = 2026-10-02
weight = 80
source = "https://gohugo.io/methods/menu-entry/pageref/"

[params.functions_and_methods]
signatures = ["MENUENTRY.PageRef"]
returnType = "string"
+++

> [!NOTE]
> 该方法的使用场景很少。
> 在几乎所有的场景中，你都应该改用 [`URL`][] 方法。

## 说明

如果在项目配置中[定义菜单条目][defining a menu entry]时指定了 `pageRef` 属性，Hugo 在渲染该条目时会查找匹配的页面。

如果找到匹配的页面：

- [`URL`][] 方法返回该页面的相对永久链接
- [`Page`][] 方法返回对应的 `Page` 对象
- `Page` 对象上的 [`HasMenuCurrent`][] 和 [`IsMenuCurrent`][] 方法返回预期值

如果没有找到匹配的页面：

- [`URL`][] 方法返回该条目的 `url` 属性（如果已设置），否则返回空字符串
- [`Page`][] 方法返回 `nil`
- `Page` 对象上的 [`HasMenuCurrent`][] 和 [`IsMenuCurrent`][] 方法返回 `false`

> [!NOTE]
> 在几乎所有的场景中，你都应该改用 [`URL`][] 方法。

## 示例

这个示例是刻意构造的。

> [!NOTE]
> 在几乎所有的场景中，你都应该改用 [`URL`][] 方法。

请看下面的内容结构：

```tree
content/
├── products.md
└── _index.md
```

以及下面的菜单定义：

```toml
[[menus.main]]
name = 'Products'
pageRef = '/products'
weight = 10
[[menus.main]]
name = 'Services'
pageRef = '/services'
weight = 20
```

使用下面的模板代码：

```go-html-template {file="layouts/_partials/menu.html"}
<ul>
  {{ range .Site.Menus.main }}
    <li><a href="{{ .URL }}">{{ .Name }}</a></li>
  {{ end }}
</ul>
```

Hugo 渲染出如下 HTML：

```html
<ul>
  <li><a href="/products/">Products</a></li>
  <li><a href="">Services</a></li>
</ul>
```

注意上面第二个 `anchor` 元素的 `href` 属性为空，因为 Hugo 找不到 `services` 页面。

使用下面的模板代码：

```go-html-template {file="layouts/_partials/menu.html"}
<ul>
  {{ range .Site.Menus.main }}
    <li><a href="{{ or .URL .PageRef }}">{{ .Name }}</a></li>
  {{ end }}
</ul>
```

Hugo 渲染出如下 HTML：

```html
<ul>
  <li><a href="/products/">Products</a></li>
  <li><a href="/services">Services</a></li>
</ul>
```

注意上面这段代码中，Hugo 把第二个 `anchor` 元素的 `href` 属性填成了项目配置里定义的 `pageRef` 属性，因为模板代码回退到了 `PageRef` 方法。

[`HasMenuCurrent`]: /methods/page/hasmenucurrent/
[`IsMenuCurrent`]: /methods/page/ismenucurrent/
[`Page`]: /methods/menu-entry/page/
[`URL`]: /methods/menu-entry/url/
[defining a menu entry]: /content-management/menus/#define-in-project-configuration
