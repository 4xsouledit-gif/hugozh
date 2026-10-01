+++
title = "内容管理"
linkTitle = "内容管理"
description = "内容管理章节总览：内容格式、前置元数据、内容组织与页面资源。"
date = 2026-10-01
weight = 20
source = "https://gohugo.io/content-management/"
+++

## 内容管理概览

内容管理关注的是内容本身：把文件放进 `content/` 目录，用前置元数据（front matter）描述页面属性，再由模板渲染成站点。本章按主题概述相关内容，各主题在官方文档中位于 `/content-management/` 下的独立页面。

内容进入站点的基本流程是：

1. 用 `hugo new content` 基于原型（archetype）创建 Markdown 等内容文件。
2. 在文件开头的 front matter 中填写标题、日期、分类等元数据。
3. 把文件放到合适的目录中，形成 section（内容区块）与页面包（page bundle）结构。
4. 由模板把内容、菜单、分类法（taxonomy）等渲染成最终页面。

## 内容格式

Hugo 根据文件扩展名判断内容格式，常用格式包括：

| 格式 | 说明 |
| --- | --- |
| Markdown | 默认格式，由 Goldmark 渲染，是最常用的写作格式 |
| HTML | 直接书写 HTML 的内容 |
| Emacs Org Mode | 使用 Org Mode 语法书写 |
| AsciiDoc | 需要本机安装相应的外部转换程序 |
| Pandoc | 借助 Pandoc 转换多种标记语言 |
| reStructuredText | 需要本机安装相应的外部转换程序 |

Markdown、HTML 与 Emacs Org Mode 由 Hugo 内置支持；AsciiDoc、Pandoc、reStructuredText 需要本机安装对应的外部程序。各格式的解析与渲染细节在配置的 `markup` 区段中调整，官方页面为 `/content-management/formats/`。

## 前置元数据（front matter）

front matter 是内容文件开头的一段元数据，Hugo 支持三种写法：

```markdown
+++
title = "我的第一篇内容"
date = 2026-10-01
draft = true
+++

正文从这里开始。
```

```markdown
---
title: 我的第一篇内容
date: 2026-10-01
draft: true
---

正文从这里开始。
```

```markdown
{
  "title": "我的第一篇内容",
  "date": "2026-10-01",
  "draft": true
}
```

- TOML 用一对 `+++` 包围。
- YAML 用一对 `---` 包围。
- JSON 用一对花括号包围。

常见字段：

| 字段 | 说明 |
| --- | --- |
| `title` | 页面标题 |
| `date` | 内容的创建或发布日期 |
| `lastmod` | 最后修改日期 |
| `draft` | 为 `true` 时属于草稿，默认不参与构建（可用 `--buildDrafts` 一并构建） |
| `weight` | 排序权重，数值越小越靠前，常用于列表与菜单排序 |
| `slug` | 覆盖由标题推导出的 URL 片段 |
| `url` | 直接指定该页面的路径 |
| `aliases` | 旧地址列表，构建时为这些地址生成重定向页面 |
| `type` | 内容类型，参与模板查找 |
| `layout` | 指定该页面使用的模板 |
| `tags`、`categories` | 默认分类法的术语（term） |
| `cascade` | 把所列的值向下传递给子页面 |

除内置字段外还可以写入任意自定义参数，模板中通过 `.Params` 读取。字段的完整列表与取值规则见官方 `/content-management/front-matter/`。

## 内容组织与 section（内容区块）

`content/` 目录的层级结构就是站点的内容结构，其中的顶层子目录构成 section（内容区块），每个 section 都可以有首页、自己的模板与页面列表。

组织内容时有两种特殊的目录形态，合称页面包（page bundle）：

- 分支包（branch bundle）：目录中有一个 `_index.md`，它代表该 section 的首页；目录内可以放置该 section 共享的资源与模板。分支包可以继续包含子目录。
- 叶子包（leaf bundle）：目录中有一个 `index.md`，它代表一个不可再分的页面；目录内的其他文件成为该页面的页面资源（page resources），不会被单独渲染为页面。

```text
content/
├── _index.md
├── posts/
│   ├── _index.md
│   ├── first-post/
│   │   ├── index.md
│   │   └── cover.jpg
│   └── second-post.md
└── about/
    └── index.md
```

要点：

- `_index.md` 用于分支包（section 首页），`index.md` 用于叶子包（单个页面）。
- 叶子包中的图片、数据文件等与页面一起被当作页面资源处理，便于相对引用。
- 内容的 `type` 与 `layout` 决定使用哪个模板，目录结构本身也会影响模板查找与列表页的生成。更完整的说明见官方 `/content-management/sections/` 与 `/content-management/page-bundles/`。

## 页面资源与图像处理

- 页面资源（page resources）：与叶子包的 `index.md` 同目录的文件是该页面专属的资源，模板中可通过 `.Resources`、`.Resources.Get`、`.Resources.GetMatch` 等访问。
- 全局资源：放在 `assets/` 目录中的文件通过 `resources.Get` 等方法获取，可经由资源管道处理后再输出。
- 图像处理：对图像资源调用 `.Resize`、`.Fit`、`.Fill`、`.Crop` 等方法即可得到处理后的图像，用于生成响应式图片；处理行为可在配置的 `imaging` 区段中调整。
- 通过模块挂载（mounts）可以把项目外部的目录映射进 `content/`、`assets/` 等位置，从而复用共享资源。

相关内容见官方 `/content-management/page-resources/` 与 `/content-management/image-processing/`。

## Markdown 属性与渲染钩子（render hook）

- Markdown 属性（Markdown attributes）：在标题、段落、列表、代码块等 Markdown 元素后附加一组属性，渲染为对应的 HTML 属性，官方页面为 `/content-management/markdown-attributes/`。
- 渲染钩子（render hook）：覆盖 Markdown 中链接、图片、标题、代码块、引用块等元素的默认渲染方式。钩子模板放在 `layouts/_default/_markup/` 目录中，文件名对应元素类型。

```text
layouts/
└── _default/
    └── _markup/
        ├── render-link.html
        ├── render-image.html
        ├── render-heading.html
        └── render-codeblock.html
```

以链接渲染钩子为例，可以这样配合局部模板（partial）输出链接：

```go-html-template
<a href="{{ .Destination | safeURL }}"{{ with .Title }} title="{{ . }}"{{ end }}>
  {{ .Text }}
</a>
```

更多示例见官方 `/render-hooks/`。

## 短代码（shortcode）

短代码（shortcode）是内容文件中可调用的模板片段，用于在 Markdown 里引入模板逻辑，而不必开启不安全渲染。

- 自定义短代码放在 `layouts/shortcodes/` 目录，文件名即短代码名。
- 调用形式有两种：`{{</* name */>}}` 与 `{{%/* name */%}}`；前者不把短代码内部的内容按 Markdown 渲染，后者会。`name` 处写短代码名，结束处用同样的标记闭合。
- 参数可以是位置参数，也可以是 `key="value"` 形式的命名参数。
- Hugo 还内置了一批短代码（例如插入图片、代码片段、视频等的短代码），用法与自定义短代码相同。

例如，一个名为 `notice` 的短代码可以这样调用：`{{</* notice type="info" */>}}` … `{{</* /notice */>}}`。

对应的短代码模板示例（`layouts/shortcodes/notice.html`）：

```go-html-template
<div class="notice notice-{{ .Get "type" | default "info" }}">
  {{ .Inner }}
</div>
```

完整说明见官方 `/shortcodes/`。

## 分类法（taxonomy）

- 分类法（taxonomy）把内容按术语（term）归类，Hugo 默认启用 `tags` 与 `categories` 两种分类法。
- 可以在配置中自定义分类法：

```toml
[taxonomies]
  tag = "tags"
  category = "categories"
  author = "authors"
```

- 在 front matter 中用同名键为页面指派术语：

```yaml
---
title: 我的第一篇内容
tags:
  - Hugo
  - 静态站点
categories:
  - 笔记
---
```

- 模板中可通过 `.GetTerms`、`.Site.Taxonomies` 等访问分类数据；每种分类法与每个术语都会生成对应的列表页面。详见官方 `/content-management/taxonomies/`。

## 菜单

- 站点菜单既可以在 front matter 中声明，也可以在配置文件里定义。
- front matter 中的菜单项：

```yaml
---
title: 关于
menus:
  main:
    weight: 20
    parent: 文档
---
```

- 配置文件中的菜单项（`config/_default/menus.toml`，或根配置的 `[menus]` 区段）：

```toml
[[menus.main]]
  name = "首页"
  pageRef = "/"
  weight = 10
```

- 常用的键包括 `name`、`pageRef`（指向站内页面）、`url`（外部或自定义地址）、`weight`（排序）、`parent`（父级菜单项）、`identifier`（供 `parent` 引用的标识）。
- 菜单项的呈现方式、排序与激活状态由菜单模板决定，详见官方 `/content-management/menus/`。

## 摘要（summary）

摘要（summary）用于在列表页展示内容梗概，来源有三种：

- front matter 中的 `summary` 字段；
- 正文中的 `<!--more-->` 分隔符，其前面的内容作为摘要；
- 未提供上述内容时，Hugo 按 `summaryLength` 自动截取正文开头。

模板中通过 `.Summary` 获取摘要，用 `.Truncated` 判断内容是否被截断。含中日韩文本的站点通常需要启用 `hasCJKLanguage`，以便按正确的方式统计长度。详见官方 `/content-management/summaries/`。

## 相关内容

- 相关内容（related content）依据一组索引字段计算页面之间的相似度，在模板中通过 `.Related` 或 `.Site.RegularPages.Related` 等获取结果。
- 索引在配置的 `related` 区段中声明，可以指定参与比较的字段及各自权重：

```toml
[related]
  threshold = 80
  includeNewer = true

  [[related.indices]]
    name = "keywords"
    weight = 100

  [[related.indices]]
    name = "tags"
    weight = 80

  [[related.indices]]
    name = "date"
    weight = 10
```

- 相关内容的呈现方式由模板决定。详见官方 `/content-management/related/`。

## 原型（archetype）与创建内容

- 原型（archetype）是创建新内容时使用的模板，默认放在 `archetypes/` 目录中，`default.md` 是所有内容类型的兜底原型。
- 用 `hugo new content` 创建内容，命令会依据目标路径确定内容类型，从而选用对应的原型：

```bash
# 使用默认原型创建一篇内容
hugo new content posts/my-first-post.md

# 指定内容类型，从对应的原型生成
hugo new content --kind posts posts/my-first-post.md
```

- 原型文件既可以是只有 front matter 的片段，也可以包含正文骨架；其中的字段会成为新内容的初始值。
- 原型模板是 Go 模板，可以使用 `.Date`、`.File`、`.Type` 等变量生成初始值，例如：

```markdown
---
title: "新内容"
date: {{ .Date }}
draft: true
---
```

完整说明见官方 `/content-management/archetypes/` 与 `/commands/hugo_new_content/`。

## 其他内容管理主题

官方内容管理章节还包含以下主题，路径均为 `/content-management/` 下的子页面（具体路径可能随文档改版调整）：

| 主题 | 官方路径 | 说明 |
| --- | --- | --- |
| 内容类型 | `/templates/types/` | 按 `type` 组织内容并决定模板 |
| 多语言 | `/content-management/multilingual/` | 多语言站点与翻译内容 |
| URL 管理 | `/content-management/urls/` | 自定义路径、别名与永久链接 |
| 语法高亮 | `/content-management/syntax-highlighting/` | 代码块高亮 |
| 数学公式 | `/content-management/mathematics/` | 在内容中排布数学公式 |
| 图表 | `/content-management/diagrams/` | 用文本描述生成流程图等图表 |
| Emoji | `/content-management/emojis/` | 在内容中插入 Emoji |
| 评论 | `/content-management/comments/` | 接入第三方评论服务 |
| 构建选项 | `/content-management/build-options/` | 控制页面与资源的构建行为 |
