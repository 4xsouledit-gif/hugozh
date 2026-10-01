+++
title = "内容类型"
linkTitle = "内容类型"
description = "内容类型的来源与作用：如何决定模板查找、如何复用模板。"
date = 2026-10-01
weight = 130
source = "https://gohugo.io/templates/types/"
+++

## 模板目录与查找依据

Hugo 在站点根目录的 `layouts/` 目录中查找模板。虽然多数站点用不到全部模板，但一个中等复杂度的站点通常长这样：

```text
layouts/
├── _markup/
│   ├── render-image.html
│   └── render-link.html
├── _partials/
│   ├── footer.html
│   └── header.html
├── _shortcodes/
│   └── audio.html
├── books/
│   ├── page.html
│   └── section.html
├── baseof.html
├── home.html
├── page.html
├── section.html
├── taxonomy.html
└── term.html
```

具体用哪个模板由查找顺序（lookup order）决定，判定时综合模板类型（template type）、页面种类（page kind）、内容类型（content type）、section（内容区块）、语言与输出格式。要为某类页面写出可预期的模板，就必须先理解这套顺序。

## 基础模板（base）

基础模板（base template）是其他模板可以叠加的骨架，通常定义 `html`、`head`、`body` 等公共结构，以及跨页面复用的页头、页脚、导航与脚本引入。

Hugo 只会在被解析的模板同时满足下面两个条件时才套用基础模板：

- 至少包含一个 `define` 动作；
- 除 `define` 动作、空白与模板注释外不含其他内容。

套用时，基础模板中的 `block` 动作会被目标模板中同名的 `define` 动作替换：

```go-html-template
{{ block "main" . }}
  这段占位内容会被对应的 define 动作替换。
{{ end }}
```

## 各模板类型的职责与回退

- `home`：渲染站点首页。
- `page`：渲染常规页面。
- `section`：渲染某个 section（内容区块）内的页面列表。
- `taxonomy`：渲染某个分类法（taxonomy）下的术语列表；模板中的 `.Data` 对象提供 `Singular`、`Plural`、`Terms` 等方法。
- `term`：渲染与某个术语关联的页面列表；`.Data` 提供 `Singular`、`Plural`、`Term`。
- `single`：`page` 的回退模板，Hugo 先找 `page`，找不到才用 `single`。
- `list`：`home`、`section`、`taxonomy`、`term` 四种模板的回退。
- `all`：以上所有模板类型的最终回退。

列表类模板中常用 `.Pages` 或 `.Site.RegularPages` 遍历页面，需要过滤、排序或分组时可选用相应的方法与函数。

除页面模板外，`layouts/` 下还有几类组件模板：局部模板（partial，位于 `_partials/`）、行内局部模板（inline partial，用 `define` 在模板内部声明）、视图模板（view，通过页面的 `Render` 方法调用）、渲染钩子（render hook，位于 `_markup/`，改写 Markdown 到 HTML 的转换）、短代码（shortcode，位于 `_shortcodes/`，供内容页面调用），以及站点地图、RSS、404 页面、robots.txt 等专用模板。

局部模板的查找只做名称匹配，不考虑页面种类、内容类型、逻辑路径、语言与输出格式。调用 `footer.section.de.html` 时，依次尝试：

```text
layouts/_partials/footer.section.de.html
layouts/_partials/footer.section.html
layouts/_partials/footer.de.html
layouts/_partials/footer.html
```

## 内容类型与资源类型

Hugo 支持六种内容格式，它们既可以作为页面内容，也可以作为页面资源（page resource）。作为页面资源时，其资源类型（resource type）为 `page`：

| 内容格式 | 媒体类型 |
| --- | --- |
| Markdown | `text/markdown` |
| HTML | `text/html` |
| Emacs Org Mode | `text/org` |
| AsciiDoc | `text/asciidoc` |
| Pandoc | `text/pandoc` |
| reStructuredText | `text/rst` |

默认情况下，资源类型为 `page` 的页面资源不会被发布，因为带标记的资源通常是并入正文使用的，单独发布往往并非本意。这一行为由 `contentTypes` 配置决定，其默认值就列出上面六种媒体类型：

```toml
[contentTypes]
  "text/asciidoc" = {}
  "text/html" = {}
  "text/markdown" = {}
  "text/org" = {}
  "text/pandoc" = {}
  "text/rst" = {}
```

要让某个媒体类型改为「不自动发布」之外的行为，只需把对应条目从列表中删除。例如删除 `text/html` 后，HTML 页面资源的资源类型变为 `text`，从而会被自动发布。

## type 字段与模板查找

除按文件位置推断出的内容类型外，还可以在前置元数据（front matter）中用 `type` 显式指定：写 `type = "posts"`，Hugo 就会优先到 `layouts/posts/` 下寻找这份内容所用的模板。`layout` 进一步指定具体模板文件名，例如 `layout = "wide"` 会优先使用该目录下的 `wide.html`：

```toml
title = "示例"
type = "posts"
layout = "wide"
```

多个 section 的内容可以指定同一个 `type`，从而共享同一套模板：即使内容分属不同目录、URL 前缀不同，呈现方式仍然一致。用 `hugo new content` 创建内容时，`--kind` 决定使用哪个原型（archetype），原型里预置的 `type` 字段会被写入新文件，从而间接影响类型。

## 延伸阅读

- [内容区块](/content-management/sections/)
- [前置元数据](/content-management/front-matter/)
- [原型](/content-management/archetypes/)
- [内容格式](/content-management/content-formats/)
- [内容管理](/content-management/)
