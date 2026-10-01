+++
title = "新版模板系统概览"
linkTitle = "新版模板系统概览"
description = "Hugo v0.146.0 重写模板系统后的目录变化、查找顺序与迁移对照。"
date = 2026-10-01
weight = 100
source = "https://gohugo.io/templates/new-templatesystem-overview/"
+++

在 [Hugo v0.146.0](https://github.com/gohugoio/hugo/releases/tag/v0.146.0) 中，Hugo 完全重新实现了 Go 模板的处理方式，包括 `layouts` 目录的结构调整与更强大的模板查找系统。为了尽量保持向后兼容，官方按「旧到新」做了映射，但仍有一些已知的破坏性变化。本文汇总其中最重要的部分。

## `layouts` 目录的变化

| 说明 | 需要做的操作 |
| --- | --- |
| 取消 `_default` 目录。 | 把 `layouts/_default` 中的文件全部上移到 `layouts/` 根目录。 |
| `layouts/partials` 更名为 `layouts/_partials`。 | 重命名目录。 |
| `layouts/shortcodes` 更名为 `layouts/_shortcodes`。 | 重命名目录。 |
| `layouts` 中任何不以 `_` 开头的目录都代表一条页面路径的根。新版中可以按需任意嵌套，`_shortcodes` 与 `_markup` 目录可放在树的任意层级。 | 无需操作。 |
| 因此不再有顶层的 `layouts/taxonomy`、`layouts/section` 目录，除非它本身代表一条页面路径。 | 把它们上移到 `layouts/`，以页面种类 `section`、`taxonomy` 或 `term` 作为基名；或者放进该分类法对应的页面路径目录。 |
| 名为 `taxonomy.html` 的模板过去同时是 `term` 与 `taxonomy` 两种页面种类的候选，现在只对 `taxonomy` 生效。 | 同时创建 `taxonomy.html` 与 `term.html`，或改用更通用的 `list.html`。 |
| 对于基础模板（如 `baseof.html`），旧版本允许把 layout、type 或 kind 之一用连字符接在 `baseof` 关键字前面。 | 把该标识符移到第一个点之后，例如把 `list-baseof.html` 改名为 `baseof.list.html`。 |
| 新增了 `all` 这种「兜底」布局。也就是说，如果只有 `layouts/all.html` 一个模板，它将用于所有 HTML 页面的渲染。 | 无需操作。 |
| 取消了 `_internal` 内置模板的概念。旧写法难以在主题中覆盖诸如 `_internal/disqus.html` 之类的模板，现在只要创建同名局部模板即可。 | 把调用内置模板的写法改为调用同名局部模板。 |
| 模板文件名中可用的标识符包括：页面种类（`home`、`page`、`section`、`taxonomy`、`term`）、标准布局（`list`、`single`、`all`）、自定义布局（front matter 中 `layout` 字段的值）、语言（如 `en`）、输出格式（如 `html`、`rss`），以及代表媒体类型的后缀。例如 `all.en.html` 与 `home.rss.xml`。 | 无需操作。 |
| 因此首页不再有 `index.html` 这种模板。 | 把 `index.html` 改名为 `home.html`。 |

## 查找顺序的变化

新版把模板查找统一成一套规则，对所有模板类型都适用，只有**局部模板**例外，因为它不感知上下文。旧方案变体极多、难以理解，新方案力求自然、少有意外。

参与模板权重的标识符，按重要程度排列如下：

| 标识符 | 说明 |
| --- | --- |
| 自定义布局 | front matter 中设置的 `layout`。 |
| 页面种类 | `home`、`section`、`taxonomy`、`term`、`page` 之一。 |
| 标准布局（一） | `list` 或 `single`。 |
| 输出格式 | 输出格式，如 `html`、`rss`。 |
| 标准布局（二） | `all`。 |
| 语言 | 语言，如 `en`。 |
| 媒体类型 | 媒体类型，如 `text/html`。 |
| 页面路径 | 页面路径，如 `/blog/mypost`。 |
| 类型 | front matter 中设置的 `type`。它会取代查找时页面路径里的 `section` 目录。 |

对于放在 `layouts` 中、与某条页面路径部分或完全匹配的模板，向上越接近该页面的匹配被认为越好。例如：

- `layouts/docs/api/_markup/render-link.html` 用于渲染页面路径 `/docs/api` 及其下级页面的链接。
- `layouts/docs/baseof.html` 用作页面路径 `/docs` 及其下级页面的基础模板。
- `layouts/tags/term.html` 用于 `tags` 分类法中所有 `term` 的渲染，但 `blue` 这个条目例外，它使用 `layouts/tags/blue/list.html`。

## 目录结构示例

```tree
layouts
├── baseof.html
├── baseof.term.html
├── home.html
├── page.html
├── section.html
├── taxonomy.html
├── term.html
├── term.mylayout.en.rss.xml
├── _markup
│   ├── render-codeblock-go.term.mylayout.no.rss.xml
│   └── render-link.html
├── _partials
│   └── mypartial.html
├── _shortcodes
│   ├── myshortcode.html
│   └── myshortcode.section.mylayout.en.rss.xml
├── docs
│   ├── baseof.html
│   ├── _shortcodes
│   │   └── myshortcode.html
│   └── api
│       ├── mylayout.html
│       ├── page.html
│       └── _markup
│           └── render-link.html
└── tags
    ├── taxonomy.html
    ├── term.html
    └── blue
        └── list.html
```

## 迁移建议

从旧版本升级时，可以按下面的顺序处理：先把 `layouts/_default` 中的文件全部上移到 `layouts/` 根目录，并把 `index.html` 改名成 `home.html`；接着重命名 `partials` 与 `shortcodes` 两个目录，补上前导下划线；然后把 `baseof` 系列模板文件名中前置的标识符移到第一个点之后；最后检查分类法模板，确保 `taxonomy.html` 与 `term.html` 各自存在，或统一改用 `list.html`。完成之后，再用[模板查找顺序](/templates/lookup-order/)确认每个页面都命中了预期的模板。
