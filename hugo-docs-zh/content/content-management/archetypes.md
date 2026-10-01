+++
title = "原型"
linkTitle = "原型"
description = "用 archetype 为新建内容预置前置元数据与正文骨架。"
date = 2026-10-01
weight = 70
source = "https://gohugo.io/content-management/archetypes/"
+++

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

## 延伸阅读

- [快速开始](/getting-started/quick-start/)
- [基本用法](/getting-started/basic-usage/)
- [前置元数据](/content-management/front-matter/)
- [内容类型](/templates/types/)
- [页面包](/content-management/page-bundles/)
