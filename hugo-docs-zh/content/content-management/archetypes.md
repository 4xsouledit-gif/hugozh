+++
title = "原型"
linkTitle = "原型"
description = "用 archetype 为新建内容预置前置元数据与正文骨架；含查找顺序、配置位置与创建时的验证方法。"
date = 2026-10-01
weight = 70
source = "https://gohugo.io/content-management/archetypes/"

[params.teach]
difficulty = "入门"
time = "10–15 分钟"
prereq = [
  "用过 `hugo new content` 创建过至少一个内容文件。",
  "知道 `content/`、`layouts/`、`archetypes/` 三个目录各自负责什么。",
]
outcomes = [
  "为某个内容类型写一个专属原型，并验证 `hugo new content` 真的用了它；",
  "说清原型的查找顺序，知道主题里的原型什么时候会被用到；",
  "用原型预置正文骨架，甚至为叶子包预置整个目录结构；",
  "解释「改了原型但旧页面没变」这类现象。",
]
next = ["/commands/hugo-new-content/", "/content-management/front-matter/", "/content-management/page-bundles/"]

+++

## 这一页解决什么问题

一份内容文件由前置元数据（front matter）与正文标记组成，正文通常是 Markdown，也可以是 Hugo 支持的其他内容格式；前置元数据可以是 TOML、YAML 或 JSON。原型（archetype）是创建新内容时使用的模板，`hugo new content` 命令会以某个原型为依据，在 `content` 目录下生成新文件。Hugo 内置的默认原型相当于：

```toml
title = '{{ replace .File.ContentBaseName `-` ` ` | title }}'
date = '{{ .Date }}'
draft = true
```

原型最大的特点是**只在创建文件的那一刻生效**。它不参与构建，也不回填已有文件——这是「我改了原型，已发布的页面却没变化」的根本原因。这一页把「放在哪、按什么顺序找、怎么确认用对了」讲清。

**验证原型是否生效**：直接创建文件并看结果（**实测：Hugo 0.167**）。

```bash
hugo new content posts/hello-world.md
```

**你应当看到什么**：终端输出 `Content "…/content/posts/hello-world.md" created`，新文件里是原型求值后的内容——用内置默认原型会得到：

```toml
+++
title = 'Hello World'
draft = true
+++
```

注意 `title` 来自 `{{ replace .File.ContentBaseName ... }}`：文件名 `hello-world` 的连字符被换成空格、再首字母大写。**如果新文件里还是 `{{ … }}` 字面量，说明放在 `content/` 或 `static/` 里的文件被当成了原型，或者你根本没在用原型**（例如手工新建文件）。原型必须放在站点根的 `archetypes/` 目录下。

## 原型是什么

一份内容文件由前置元数据（front matter）与正文标记组成，正文通常是 Markdown，也可以是 Hugo 支持的其他内容格式；前置元数据可以是 TOML、YAML 或 JSON。原型（archetype）是创建新内容时使用的模板，`hugo new content` 命令会以某个原型为依据，在 `content` 目录下生成新文件。Hugo 内置的默认原型相当于：

```toml
title = '{{ replace .File.ContentBaseName `-` ` ` | title }}'
date = '{{ .Date }}'
draft = true
```

执行命令时，Hugo 会对原型中的模板动作求值：

```bash
hugo new content posts/my-first-post.md
```

用上面的默认原型，得到的新文件大致是：

```toml
title = 'My First Post'
date = '2023-08-24T11:49:46-07:00'
draft = true
```

可以为一种或多种内容类型分别建立原型，例如文章使用专属原型，其余内容仍走默认原型：

```text
archetypes/
├── default.md
└── posts.md
```

## 查找顺序

原型在站点根目录的 `archetypes/` 目录中查找，找不到时回退到主题或已安装模块的 `archetypes/` 目录。针对具体内容类型的原型优先于默认原型。假设启用了名为 `my-theme` 的主题，执行 `hugo new content posts/my-first-post.md` 时的查找顺序为：

1. `archetypes/posts.md`
1. `themes/my-theme/archetypes/posts.md`
1. `archetypes/default.md`
1. `themes/my-theme/archetypes/default.md`

若这些文件都不存在，Hugo 使用内置的默认原型。

## 可用的函数与上下文

原型中可以使用任意模板函数，例如内置默认原型用字符串替换把文件名里的连字符换成空格。原型可访问的上下文包括：

- `.Date`：当前日期时间，按 RFC3339 格式化。
- `.File`：当前页面的文件信息。
- `.Type`：由顶层目录名推断出的内容类型，或由 `hugo new content` 的 `--kind` 标志指定的类型。
- `.Site`：当前站点对象。

要写入其他格式的日期时间，用 `time.Now` 自行格式化：

```toml
title = '{{ replace .File.ContentBaseName `-` ` ` | title }}'
date = '{{ time.Now.Format "2006-01-02" }}'
draft = true
```

## 用原型预置正文

原型通常用于预置前置元数据，但也可以用来预置正文。例如文档站点中的函数页面都遵循「简述、签名、示例、备注」的固定结构，就可以把这一骨架写进原型，提醒作者按格式补齐：

````markdown
---
date: '{{ .Date }}'
draft: true
title: '{{ replace .File.ContentBaseName `-` ` ` | title }}'
---

用第三人称单数、一般现在时简述该函数的作用。例如：

`someFunction` 返回把字符串 `s` 重复 `n` 次的结果。

## Signature

```text
func someFunction(s string, n int) string
```

## Examples

一个或多个可运行的示例，每例放在独立的围栏代码块中。

## Notes

需要时补充的说明。
````

正文里同样可以写模板动作，但要记住：它们只在创建内容的那一刻求值一次。多数情况下，把模板动作放进构建时求值的模板更合适。

## 叶子包原型

也可以为叶子包（leaf bundle）建立原型。例如摄影站点的每个画廊都是一个包含正文与图片的叶子包，先为它建立原型：

```text
archetypes/
├── galleries/
│   ├── images/
│   │   └── .gitkeep
│   └── index.md
└── default.md
```

原型中的子目录必须至少包含一个文件，否则创建内容时 Hugo 不会创建该子目录；文件的名字与大小无关，上面的 `.gitkeep` 就是一个用来占位的空文件。随后创建画廊：

```bash
hugo new galleries/bryce-canyon
```

得到的结果是：

```text
content/
├── galleries/
│   └── bryce-canyon/
│       ├── images/
│       │   └── .gitkeep
│       └── index.md
└── _index.md
```

## 指定原型

用 `--kind` 命令行标志可以在创建内容时显式指定原型。假设站点有 articles 与 tutorials 两个 section，并各有一个同名原型，则：

```bash
hugo new content articles/something.md
hugo new content --kind tutorials articles/something.md
```

第一条命令使用 `archetypes/articles.md`，第二条虽然目标仍在 articles 目录下，却使用 `archetypes/tutorials.md`——内容的位置与所用的原型由此解耦。

## 什么时候用原型、什么时候别用

**该用**：

- 一个内容类型下的所有页面都需要同一批前置元数据（`draft`、默认标签、作者等）；
- 希望新页面自带固定结构（「简述 / 签名 / 示例 / 备注」这类骨架），提醒作者别漏内容；
- 需要为叶子包一次性建好目录与占位文件（例如画廊的 `images/`）。

**别用**：

- **想靠原型修改已有页面**——原型只在创建时读一次，改它不会回填旧文件；要统一改动已有页面请用 `cascade`（见[前置元数据](/content-management/front-matter/)）或直接批量改文件；
- **想在每次构建时生成内容**——原型不参与构建；动态生成页面应该用[内容适配器](/content-management/content-adapters/)；
- **把每次构建都要重算的模板动作写进正文**——正文里的模板动作只在创建那一刻求值一次，构建时不会重新计算；这类逻辑应放在 `layouts/` 的模板里。

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 没报错但结果不对 | 改了原型，已有页面没有任何变化 | 原型只在 `hugo new content` 创建文件时读取一次 | 属预期行为；批量修改已有文件请用 `cascade` 或直接改文件 |
| 没报错但结果不对 | 新建的文件里 `title` 是 `{{ replace … }}` 字面量 | 那个文件不是用 `hugo new content` 建的，或原型根本不在 `archetypes/` 下 | 用 `hugo new content <路径>` 重建；确认原型位于**站点根**的 `archetypes/` |
| 没报错但结果不对 | 叶子包原型里的子目录没有建出来 | 原型中的子目录必须至少包含一个文件（例如 `.gitkeep`） | 往每个子目录里放一个占位文件，名字与内容无所谓 |
| 没报错但结果不对 | 用了 `posts.md`，结果套的是 `default.md` | 内容类型与原型文件名不匹配：类型由顶层目录名或 `--kind` 决定 | 检查目标路径的顶层目录名，或显式加 `--kind`；对照[查找顺序](#查找顺序)逐条核对 |
| 没报错但结果不对 | 主题里的原型突然被项目原型覆盖了 | 项目根目录的 `archetypes/` 优先于主题与模块 | 这是设计如此；要保留主题的行为就别在项目里放同名文件 |
| 报错看不懂 | `hugo new content` 报文件已存在 | 目标路径上已有同名文件（常见于重复执行命令） | 换个路径，或先删除/改名已有文件；不要指望命令覆盖 |
| 报错看不懂 | 原型里的模板动作报错，指向原型文件 | 原型中的模板语法写错（引号、管道、函数名） | 原型是 Go 模板，报错行号指向原型文件本身；先把它简化为最小可用版本再逐步加回 |

更多排查入口见[故障排查](/troubleshooting/)。

## 延伸阅读

- [快速开始](/getting-started/quick-start/)
- [基本用法](/getting-started/basic-usage/)
- [前置元数据](/content-management/front-matter/)
- [内容类型](/templates/types/)
- [页面包](/content-management/page-bundles/)
