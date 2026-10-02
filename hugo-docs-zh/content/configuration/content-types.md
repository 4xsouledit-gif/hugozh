+++
title = "内容类型配置"
linkTitle = "内容类型配置"
description = "通过 contentTypes 控制哪些媒体类型作为可发布资源。"
date = 2026-10-01
weight = 60
source = "https://gohugo.io/configuration/content-types/"
+++

## 这一页解决什么问题

`[contentTypes]` 决定「哪些媒体类型的页面资源被当作内容，从而**不**被单独发布」。默认六个媒体类型（Markdown、HTML、Org Mode、AsciiDoc、Pandoc、reStructuredText）都算内容。

只有一种场景需要改它：你**希望**把页面资源里的某个文件（例如一份 `text/html` 报告）像普通资源一样发布到 `public/`。改的时候请记住列表是**整体替换**的：想只移除一项，也要把其余项写全。

## 什么时候需要这些设置

| 设置 | 什么时候需要 | 改错了会看到什么现象 |
| --- | --- | --- |
| 保留默认六项 | 页面资源里的标记文件只用于并入正文 | 这是默认且多数情况下正确的行为 |
| 移除某一项（如 `text/html`） | 想让该类型的页面资源被自动发布 | 移除后该资源会像普通资源一样进入 `public/`；若它本不该公开，等于把内部文件发布了 |
| 新增自定义媒体类型 | 站点使用别的标记格式，并希望按内容处理 | 媒体类型字符串与[媒体类型配置](/configuration/media-types/)不一致 → 配置不匹配任何文件，该资源仍会被发布，且**不报错** |

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

## 常见坑

| 症状 | 真因 | 怎么修 |
| --- | --- | --- |
| 只想放行 `text/html`，结果其它类型的资源也被发布了 | 列表是整体替换，其余五项没写回 | 参照本页示例，把 `text/asciidoc`、`text/markdown`、`text/org`、`text/pandoc`、`text/rst` 一并保留 |
| 改了配置，`public/` 里仍没有该文件 | 媒体类型字符串写法不对（大小写、斜杠）或不匹配任何文件 | 与[媒体类型配置](/configuration/media-types/)中定义的标识逐字对齐 |
| 页面资源里的 `.md` 没有出现在产物中 | 这是**默认行为**：`text/markdown` 属于内容类型，不会单独发布 | 预期结果；需要输出就在模板中通过 `.Resources` 取值处理 |
| 报错看不懂 | 该分区不做取值校验，多数情况下不会报错 | 用 `hugo config` 查看生效的 `[contentTypes]`；仍不对见[故障排查](/troubleshooting/) |

更多排查入口见[故障排查](/troubleshooting/)。
