+++
title = "内容管理"
linkTitle = "内容管理"
description = "内容管理章节总览：内容格式、前置元数据、内容组织与页面资源；含本章阅读顺序与最容易配错的几处索引。"
date = 2026-10-01
weight = 20
source = "https://gohugo.io/content-management/"

[params.teach]
difficulty = "入门"
time = "10 分钟"
prereq = [
  "已经能跑通 `hugo` 或 `hugo server`，知道站点根目录里有哪些目录。",
]
outcomes = [
  "说清一个内容文件从 `content/` 到发布页面的四步流程；",
  "按阅读顺序找到「前置元数据、页面包、页面资源、分类法、菜单」各自该看哪一页；",
  "知道本章哪几页最容易配错，以及每页对应的验证命令。",
]
next = ["/content-management/front-matter/", "/content-management/page-bundles/", "/content-management/organization/"]

+++

## 这一页解决什么问题

这是「内容管理」章节的入口页。它要解决的问题不是某个具体配置，而是**把 23 页散落的主题串成一条能落地的路径**：内容从 `content/` 里的一个文件，经过前置元数据、页面包与页面资源，再加上分类法与菜单，最终变成站点上的页面与导航。

读这一页的正确用法是：**先按下面的阅读顺序定位到对应页，再照着那一页的「常见坑」排查**。如果只想确认本章内容真的都构建出来了，用这条命令：

```bash
hugo list all
```

**你应当看到什么**：`hugo list all` 的 `path` 列里，`content/content-management/` 下会出现本目录的全部页面（连同全站其它章节一起列出）；本站在侧栏按 `weight` 顺序展开本章条目。若某个页面没列出来，先检查它是否 `draft = true`，或 `[build]` 里把 `list` 设成了 `never`——两种情况都不会报错。

## 读完本章你应该能够

- 搭建出「目录结构 → 页面 → 资源」三者的正确对应关系，并用 `hugo list all` 与 `public/` 的目录树自查；
- 写出合法的[前置元数据](/content-management/front-matter/)，把自定义数据放进 `params`，并在模板里安全地取值；
- 分清[分支包与叶子包](/content-management/page-bundles/)，知道 `index.md` 与 `_index.md` 各自会带来什么结果；
- 用[页面资源](/content-management/page-resources/)把图片、数据文件绑到某一个页面上，并控制它们是否发布；
- 在[分类法](/content-management/taxonomies/)与[菜单](/content-management/menus/)之间做出正确选择，并把配置写到正确的位置；
- 需要控制页面是否发布、URL 长什么样时，知道去找[构建选项](/content-management/build-options/)与 [URL 管理](/content-management/urls/)。

## 阅读顺序

本章 23 页按「先建结构、再配元数据、最后处理输出」排列。第一次读建议按下面的顺序走，每一步都有能立刻验证的结果：

1. **先弄懂目录**：[内容组织](/content-management/organization/) → [内容区块](/content-management/sections/) → [页面包](/content-management/page-bundles/)。读完这三页，你能看着 `content/` 目录说出每一页的 URL。
2. **再配元数据**：[内容格式](/content-management/formats/) → [前置元数据](/content-management/front-matter/) → [页面资源](/content-management/page-resources/)。读完能写出一个带图片、带自定义参数、能被模板正确读取的页面。
3. **然后建横向关系**：[分类法](/content-management/taxonomies/) → [菜单](/content-management/menus/) → [相关内容](/content-management/related-content/) → [多语言](/content-management/multilingual/)。
4. **最后控制输出**：[摘要](/content-management/summaries/) → [URL 管理](/content-management/urls/) → [构建选项](/content-management/build-options/) → [语法高亮](/content-management/syntax-highlighting/) → [图表](/content-management/diagrams/) → [数学公式](/content-management/mathematics/)。
5. **按需查阅**：[原型](/content-management/archetypes/)（用 `hugo new content` 批量建文件时）、[内容适配器](/content-management/content-adapters/)（用代码生成页面时）、[数据源](/content-management/data-sources/)（`data/` 目录）、[评论](/content-management/comments/)、[Markdown 属性](/content-management/markdown-attributes/)（很少用，用到再看）、[图像处理](/content-management/image-processing/)（参考页，按需查方法）。

> [!TIP]
> 每一页末尾都有一张「常见坑」表，按「症状 → 真因 → 怎么修」组织。遇到问题时先在自己的页面上用 `hugo list all` 与产物目录对照，再回查对应页面的那张表，通常不用通读全文。

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

除内置字段外还可以写入任意自定义参数，模板中通过 `.Params` 读取。字段的完整列表与取值规则见[前置元数据](/content-management/front-matter/)。

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
- 内容的 `type` 与 `layout` 决定使用哪个模板，目录结构本身也会影响模板查找与列表页的生成。更完整的说明见[内容区块](/content-management/sections/)与[页面包](/content-management/page-bundles/)。

## 页面资源与图像处理

- 页面资源（page resources）：与叶子包的 `index.md` 同目录的文件是该页面专属的资源，模板中可通过 `.Resources`、`.Resources.Get`、`.Resources.GetMatch` 等访问。
- 全局资源：放在 `assets/` 目录中的文件通过 `resources.Get` 等方法获取，可经由资源管道处理后再输出。
- 图像处理：对图像资源调用 `.Resize`、`.Fit`、`.Fill`、`.Crop` 等方法即可得到处理后的图像，用于生成响应式图片；处理行为可在配置的 `imaging` 区段中调整。
- 通过模块挂载（mounts）可以把项目外部的目录映射进 `content/`、`assets/` 等位置，从而复用共享资源。

相关内容见[页面资源](/content-management/page-resources/)与[图像处理](/content-management/image-processing/)。

## Markdown 属性与渲染钩子（render hook）

- Markdown 属性（Markdown attributes）：在标题、段落、列表、代码块等 Markdown 元素后附加一组属性，渲染为对应的 HTML 属性，见 [Markdown 属性](/content-management/markdown-attributes/)。
- 渲染钩子（render hook）：覆盖 Markdown 中链接、图片、标题、代码块、引用块等元素的默认渲染方式。钩子模板放在 `layouts/_markup/` 目录中，文件名对应元素类型（旧式布局系统里是 `layouts/_default/_markup/`，两种写法本项目不要混用）。

```text
layouts/
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

更多示例见[渲染钩子](/render-hooks/)。

## 短代码（shortcode）

短代码（shortcode）是内容文件中可调用的模板片段，用于在 Markdown 里引入模板逻辑，而不必开启不安全渲染。

- 自定义短代码放在 `layouts/_shortcodes/` 目录（旧式布局系统为 `layouts/shortcodes/`），文件名即短代码名。
- 调用形式有两种：`{{</* name */>}}` 与 `{{%/* name */%}}`；前者不把短代码内部的内容按 Markdown 渲染，后者会。`name` 处写短代码名，结束处用同样的标记闭合。
- 参数可以是位置参数，也可以是 `key="value"` 形式的命名参数。
- Hugo 还内置了一批短代码（例如插入图片、代码片段、视频等的短代码），用法与自定义短代码相同。

例如，一个名为 `notice` 的短代码可以这样调用：`{{</* notice type="info" */>}}` … `{{</* /notice */>}}`。

对应的短代码模板示例（`layouts/_shortcodes/notice.html`）：

```go-html-template
<div class="notice notice-{{ .Get "type" | default "info" }}">
  {{ .Inner }}
</div>
```

完整说明见[短代码](/shortcodes/)。

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

- 模板中可通过 `.GetTerms`、`.Site.Taxonomies` 等访问分类数据；每种分类法与每个术语都会生成对应的列表页面。详见[分类法](/content-management/taxonomies/)。

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
- 菜单项的呈现方式、排序与激活状态由菜单模板决定，详见[菜单](/content-management/menus/)与[菜单模板](/templates/menu/)。

## 摘要（summary）

摘要（summary）用于在列表页展示内容梗概，来源有三种：

- front matter 中的 `summary` 字段；
- 正文中的 `<!--more-->` 分隔符，其前面的内容作为摘要；
- 未提供上述内容时，Hugo 按 `summaryLength` 自动截取正文开头。

模板中通过 `.Summary` 获取摘要，用 `.Truncated` 判断内容是否被截断。含中日韩文本的站点通常需要启用 `hasCJKLanguage`，以便按正确的方式统计长度。详见[摘要](/content-management/summaries/)。

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

- 相关内容的呈现方式由模板决定。详见[相关内容](/content-management/related-content/)。

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

完整说明见[原型](/content-management/archetypes/)与 [hugo new content](/commands/hugo-new-content/)。

## 常见坑（本章通用）

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 构建失败 | 报错里有 `U+00FF` / `toml: invalid character at start of key` | 文件被写成了 UTF-16LE+BOM（常见于用 PowerShell 的 `Out-File`/`>>` 生成内容） | 另存为「UTF-8 无 BOM」；不要用 PowerShell 重定向写内容文件 |
| 构建失败 | `failed to extract shortcode: template for shortcode "…" not found` | 内容里照抄了上游文档的短代码，而本站只有 `note` 一个短代码 | 把调用改成等价的纯 Markdown，或改用 `note`——见[短代码](/shortcodes/) |
| 没报错但结果不对 | 页面没出现在站点里 | `draft = true`、`publishDate` 在未来、`expiryDate` 已过，或 `[build]` 里 `list`/`render` 设成了 `never` | `hugo list drafts` / `hugo list future` / `hugo list expired` 定位；构建选项见[构建选项](/content-management/build-options/) |
| 没报错但结果不对 | 模板里取不到图片、数据文件 | 文件不在页面包目录里（放进了 `static/`、`assets/` 或 `content/` 根目录） | 移进包目录，或改用对应的全局资源函数——见[页面资源](/content-management/page-resources/) |
| 没报错但结果不对 | 目录里两个索引文件「只有一个生效」 | 同一目录同时有 `index.md` 与 `_index.md` 时，`index.md` 胜出、`_index.md` 被静默忽略（实测：Hugo 0.167） | 二选一，删掉另一个——见[页面包](/content-management/page-bundles/) |
| 没报错但结果不对 | 改了配置却像没生效 | 裸键写在了某个 `[table]` 表头之后，被并进了那张表（TOML 规则） | 把顶层标量键写在所有表头之前；用 `hugo config` 核对最终生效的配置 |
| 报错看不懂 | 站内链接点击 404 | 站点输出 URL 全小写，而链接里写了驼峰 | 站内链接一律写小写根相对路径；构建后用链接检查脚本核对 |

更多排查入口见[故障排查](/troubleshooting/)。

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
| Emoji | `/quick-reference/emojis/` | 在内容中插入 Emoji（`emojify` 函数与相关配置） |
| 评论 | `/content-management/comments/` | 接入第三方评论服务 |
| 构建选项 | `/content-management/build-options/` | 控制页面与资源的构建行为 |
