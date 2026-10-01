+++
title = "RSS 订阅"
linkTitle = "RSS 订阅"
description = "控制订阅源的生成范围与条数，或编写自定义 RSS 模板。"
date = 2026-10-01
weight = 40
source = "https://gohugo.io/templates/rss/"
+++

## 配置

默认情况下，构建项目时 Hugo 会为**首页、section、分类法（taxonomy）与分类法条目（term）**页面生成 RSS 订阅源。生成范围由项目配置中的 `[outputs]` 决定。例如，只为首页和 section 页面生成，而不为分类法与条目页面生成：

```toml {file="hugo.toml"}
[outputs]
home = ['html', 'rss']
section = ['html', 'rss']
taxonomy = ['html']
term = ['html']
```

要彻底关闭所有页面类型的订阅源生成：

```toml {file="hugo.toml"}
disableKinds = ['rss']
```

## 条数限制

默认情况下，每个订阅源中的条目数量不限。可以按需要在项目配置中修改：

```toml {file="hugo.toml"}
[services.rss]
limit = 42
```

把 `limit` 设为 `-1` 表示每个订阅源的条目数不设上限。条数较少时订阅源文件更小，抓取端也更省流量。

内建的 RSS 模板还会读取项目配置中的以下值（如果设置了的话）并渲染进订阅源：

```toml {file="hugo.toml"}
copyright = '© 2023 ABC Widgets, Inc.'
[params.author]
name = 'John Doe'
email = 'jdoe@example.org'
```

## 在页面中引用订阅源

要在渲染出的页面 `head` 元素中加入订阅源引用，把下面这段放进模板的 `head` 元素内：

```go-html-template
{{ with .OutputFormats.Get "rss" }}
  {{ printf `<link rel=%q type=%q href=%q title=%q>` .Rel .MediaType.Type .Permalink site.Title | safeHTML }}
{{ end }}
```

Hugo 会把它渲染成：

```html
<link rel="alternate" type="application/rss+xml" href="https://example.org/index.xml" title="ABC Widgets">
```

用 `.OutputFormats.Get "rss"` 判断当前页面是否配置了 RSS 输出，只有存在时才输出链接，可以避免为没有订阅源的页面生成空标签。

## 自定义模板

创建自己的 RSS 模板即可覆盖 Hugo 的内建模板。例如，为首页、section、分类法、条目页面分别使用不同的模板：

```tree
layouts/
  ├── home.rss.xml
  ├── section.rss.xml
  ├── taxonomy.rss.xml
  └── term.rss.xml
```

文件名由「页面类型 + 输出格式」组成，`rss` 对应 RSS 输出格式，因此可以针对不同页面类型给出不同的订阅源结构。RSS 模板的上下文中可以访问 `.Page` 和 `.Site` 对象。
