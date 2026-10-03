+++
title = "Type"
linkTitle = "Type"
description = "返回给定页面的内容类型。"
date = 2026-10-02
weight = 870
source = "https://gohugo.io/methods/page/type/"

[params.functions_and_methods]
signatures = ["PAGE.Type"]
returnType = "string"
+++

## 这一页解决什么问题

`.Type` 返回页面的**内容类型**（`string`）：默认等于顶层目录名，但可以在 front matter 里用 `type` 覆盖。它决定两件事：

1. `where` 筛选时的分组依据（把散落在不同 section 的同类内容聚到一起）；
2. Hugo 选模板时的查找键（`layouts/<type>/…`）。

它和 [`.Section`](/methods/page/section/) 平时相同，**一旦写了 `type` 就会分叉**（实测见下）。

## 什么时候用，什么时候别用

**该用**：

- 「不管放在哪个目录，只要是同一类内容就列出来」——`where site.RegularPages "Type" "books"`；
- 想用目录名之外的名字组织模板（`layouts/books/single.html`）。

**别用**：

- 想要目录结构（页面实际放在哪）→ 用 [`.Section`](/methods/page/section/) 或 [`.Path`](/methods/page/path/)；
- 想按 MIME/媒体类型判断 → 那是资源对象的 `.MediaType`；
- 想判断「这是什么页面」（page/section/home）→ 用 [`.Kind`](/methods/page/kind/)。

**`.Type` 与 `.Section`（实测）**：

| 页面 | `.Type` | `.Section` |
| --- | --- | --- |
| `/posts/post-2/` | `posts`（与目录名相同） | `posts` |
| `/posts/typed-page/`（front matter `type = "books"`） | `books` | `posts` |

## 用法

`Page` 对象上的 `Type` 方法返回给定页面的[内容类型](g)。内容类型由前置元数据中的 `type` 字段定义；如果前置元数据中没有定义 `type` 字段，则根据顶层目录名推断。

内容结构如下：

```tree
content/
├── auction/
│   ├── _index.md
│   ├── item-1.md
│   └── item-2.md  <-- front matter: type = books
├── books/
│   ├── _index.md
│   ├── book-1.md
│   └── book-2.md
├── films/
│   ├── _index.md
│   ├── film-1.md
│   └── film-2.md
└── _index.md
```

要列出这些 book，而不论其属于哪个 [section](g)：

```go-html-template
{{ range where .Site.RegularPages.ByTitle "Type" "books" }}
  <h2><a href="{{ .RelPermalink }}">{{ .Title }}</a></h2>
{{ end }}
```

Hugo 会把它渲染为;

```html
<h2><a href="/books/book-1/">Book 1</a></h2>
<h2><a href="/books/book-2/">Book 2</a></h2>
<h2><a href="/auction/item-2/">Item 2</a></h2>
```

前置元数据中的 `type` 字段在指定模板时也很有用。详见[说明][]。

## 完整示例：按类型跨目录归类

测试站的 `content/posts/` 下有两个页面：

```toml
# content/posts/post-2.md（没有 type）
title = "第二篇"
```

```toml
# content/posts/typed-page.md（type 覆盖为 books）
title = "类型覆盖页"
type = "books"
```

模板（`layouts/index.html`）：

```go-html-template {file="layouts/index.html"}
{{ range where site.RegularPages "Type" "books" }}
  <h2><a href="{{ .RelPermalink }}">{{ .Title }}</a></h2>
{{ end }}
```

实测（Hugo 0.167.0）渲染首页：

```html
<h2><a href="/posts/typed-page/">类型覆盖页</a></h2>
```

该页面自身的两个方法实测为：

```text
.Type    → books
.Section → posts
```

**你应当看到什么**：`where … "Type" "books"` 选中了 `/posts/` 目录下的页面——因为它把类型覆盖成了 `books`。同时 `.Section` 仍是 `posts`（目录决定），说明「类型」与「位置」是两件事。若把 `where` 的条件改成 `"Section" "books"`，这一页就不会出现。

## 返回值边界（实测）

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| 未写 `type` | 顶层目录名（实测 `/posts/post-2/` → `posts`） | 否 |
| 写了 `type` | 该值（实测 `books`） | 否 |
| 与 `.Section` 的关系 | 未写 `type` 时相同；写了就分叉（实测 `books` vs `posts`） | 否 |
| 嵌套目录 | 仍取**顶层**目录名（与 `.Section` 同规则） | 否 |
| 列表页（section/taxonomy/term） | 也有值（用于模板查找），本站未逐项实测 | 否 |
| 返回类型 | `string` | 否 |

更多排查入口见[故障排查](/troubleshooting/)。

[details]: /templates/lookup-order/#target-a-template
