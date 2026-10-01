+++
title = "菜单配置"
linkTitle = "菜单配置"
description = "在项目配置中集中定义各菜单的菜单项。"
date = 2026-10-01
weight = 140
source = "https://gohugo.io/configuration/menus/"
+++

定义菜单项有三种方式：自动生成、在页面前置元数据中定义，以及在项目配置中定义。本页介绍项目配置方式，菜单系统的整体说明见[内容管理中的菜单](/content-management/menus/)。

## 示例

在项目配置中为 `main` 菜单定义菜单项：

```toml
[[menus.main]]
name = 'Home'
pageRef = '/'
weight = 10

[[menus.main]]
name = 'Products'
pageRef = '/products'
weight = 20

[[menus.main]]
name = 'Services'
pageRef = '/services'
weight = 30
```

这样会生成一个菜单结构，可以在 `Site` 对象上通过 `Menus` 方法访问：

```go-html-template
{{ range .Site.Menus.main }}
  ...
{{ end }}
```

再定义一个 `footer` 菜单：

```toml
[[menus.footer]]
name = 'Terms'
pageRef = '/terms'
weight = 10

[[menus.footer]]
name = 'Privacy'
pageRef = '/privacy'
weight = 20
```

访问方式完全相同：

```go-html-template
{{ range .Site.Menus.footer }}
  ...
{{ end }}
```

## 菜单项字段

菜单项通常至少需要三个属性：`name`、`weight`，以及 `pageRef` 或 `url` 二者之一。内部页面目标用 `pageRef`，外部目标用 `url`。

| 键名 | 类型 | 说明 |
| --- | --- | --- |
| `identifier` | `string` | 当两个及以上菜单项的 `name` 相同，或需要用翻译表本地化 `name` 时必填。必须以字母开头，后接字母、数字或下划线。 |
| `name` | `string` | 渲染菜单项时显示的文本。 |
| `params` | `map` | 用户自定义的菜单项属性。 |
| `parent` | `string` | 父菜单项的 `identifier`；若父项未定义 `identifier`，则填其 `name`。嵌套菜单中的子项必填。 |
| `post` | `string` | 渲染菜单项时追加在后面的 HTML。 |
| `pre` | `string` | 渲染菜单项时添加在前面的 HTML。 |
| `title` | `string` | 渲染出的菜单项的 HTML `title` 属性。 |
| `weight` | `int` | 非零整数，表示该菜单项相对菜单根（子项则相对其父项）的位置。数值小者靠前，数值大者靠后。 |
| `pageRef` | `string` | 目标页面的逻辑路径，取值见下表。 |
| `url` | `string` | 目标 URL，仅用于外部目标。 |

`pageRef` 的取值随页面种类而不同：

| 页面种类 | `pageRef` |
| --- | --- |
| home | `/` |
| page | `/books/book-1` |
| section | `/books` |
| taxonomy | `/tags` |
| term | `/tags/foo` |

## 嵌套菜单

下面的嵌套菜单展示了更多可用属性：

```toml
[[menus.main]]
name = 'Products'
pageRef = '/products'
weight = 10

[[menus.main]]
name = 'Hardware'
pageRef = '/products/hardware'
parent = 'Products'
weight = 1

[[menus.main]]
name = 'Software'
pageRef = '/products/software'
parent = 'Products'
weight = 2

[[menus.main]]
name = 'Services'
pageRef = '/services'
weight = 20

[[menus.main]]
name = 'Hugo'
pre = '<i class="fa fa-heart"></i>'
url = 'https://gohugo.io/'
weight = 30
[menus.main.params]
rel = 'external'
```

其中 `Hardware` 与 `Software` 通过 `parent = 'Products'` 成为子项，`Hugo` 使用 `pre` 插入图标、用 `url` 指向外部地址，并通过 `params` 自定义了一个 `rel` 属性，供菜单模板读取。用 `pageRef` 而不是硬编码路径的好处是：即使开启多语言或调整 URL 策略，链接仍会指向正确的页面。
