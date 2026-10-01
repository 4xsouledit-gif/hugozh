+++
title = "内容类型配置"
linkTitle = "内容类型配置"
description = "通过 contentTypes 控制哪些媒体类型作为可发布资源。"
date = 2026-10-01
weight = 60
source = "https://gohugo.io/configuration/content-types/"
+++

## 支持的内容格式

Hugo 0.144.0 及更高版本支持六种内容格式：

| 内容格式 | 媒体类型 | 标识符 | 文件扩展名 |
| --- | --- | --- | --- |
| Markdown | `text/markdown` | `markdown` | `markdown`、`md`、`mdown` |
| HTML | `text/html` | `html` | `htm`、`html` |
| Emacs Org Mode | `text/org` | `org` | `org` |
| AsciiDoc | `text/asciidoc` | `asciidoc` | `ad`、`adoc`、`asciidoc` |
| Pandoc | `text/pandoc` | `pandoc` | `pandoc`、`pdc` |
| reStructuredText | `text/rst` | `rst` | `rst` |

这些格式既可以作为页面内容，也可以作为页面资源。作为页面资源时，它们的资源类型是 `page`。

看一个页面包的例子：

```tree
content/
└── example/
    ├── index.md  <-- content
    ├── a.adoc    <-- resource (resource type: page)
    ├── b.html    <-- resource (resource type: page)
    ├── c.md      <-- resource (resource type: page)
    ├── d.org     <-- resource (resource type: page)
    ├── e.pdc     <-- resource (resource type: page)
    ├── f.rst     <-- resource (resource type: page)
    ├── g.jpg     <-- resource (resource type: image)
    └── h.png     <-- resource (resource type: image)
```

`index.md` 是该页面的内容，其余文件都是页面资源。文件 `a` 到 `f` 的资源类型是 `page`，`g` 与 `h` 的资源类型是 `image`。

构建站点时，Hugo 不会发布资源类型为 `page` 的页面资源。上面站点构建的结果是：

```tree
public/
├── example/
│   ├── g.jpg
│   ├── h.png
│   └── index.html
└── index.html
```

多数情况下这一默认行为是合适的：含有标记语言内容的页面资源通常是为了并入主内容而存在，单独发布它们一般没有意义。

## contentTypes 配置

默认行为由 `contentTypes` 配置决定，默认配置如下：

```toml
[contentTypes]
  'text/asciidoc' = {}
  'text/html' = {}
  'text/markdown' = {}
  'text/org' = {}
  'text/pandoc' = {}
  'text/rst' = {}
```

对应关系如下：

| 键名 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `contentTypes` | `map` | 上表六个媒体类型 | 列出的媒体类型对应的页面资源会被赋予 `page` 资源类型，并且不会被自动发布。 |
| `text/asciidoc` | `map` | `{}` | AsciiDoc 内容。 |
| `text/html` | `map` | `{}` | HTML 内容。 |
| `text/markdown` | `map` | `{}` | Markdown 内容。 |
| `text/org` | `map` | `{}` | Emacs Org Mode 内容。 |
| `text/pandoc` | `map` | `{}` | Pandoc 内容。 |
| `text/rst` | `map` | `{}` | reStructuredText 内容。 |

在这一默认配置下，具有上述媒体类型的页面资源会被赋予 `page` 资源类型，并且不会被自动发布。若想把某个媒体类型的资源类型从 `page` 改为 `text`，只需从列表中移除对应条目。

例如，把 `text/html` 文件的资源类型设为 `text`，从而允许其被自动发布，就要移除 `text/html` 条目：

```toml
[contentTypes]
  'text/asciidoc' = {}
  'text/markdown' = {}
  'text/org' = {}
  'text/pandoc' = {}
  'text/rst' = {}
```

同样的配置用 YAML 写作：

```yaml
contentTypes:
  text/asciidoc: {}
  text/markdown: {}
  text/org: {}
  text/pandoc: {}
  text/rst: {}
```

改动后的效果是：`text/html` 资源类型的页面资源不再被赋予 `page`，因而会像普通资源一样被发布到 `public` 目录中。
