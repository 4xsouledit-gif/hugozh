+++
title = "Params"
linkTitle = "Params"
description = "返回给定页面前置元数据中定义的自定义参数映射。"
date = 2026-10-02
weight = 520
source = "https://gohugo.io/methods/page/params/"

[params.functions_and_methods]
signatures = ["PAGE.Params"]
returnType = "maps.Params"
+++

## 这一页解决什么问题

`.Params` 是**当前页面前置元数据的映射**（`maps.Params`）。用它来读取作者在 front matter 里写的自定义字段，或者整体遍历它们（例如「把所有自定义字段渲染成表格」）。

注意它和 [`.Param`](/methods/page/param/) 的两点差别：

1. `.Params` **不会**回退到站点参数，只看本页；
2. `.Params` 是映射，可以用 `range`、`index`、`.Params.a.b` 链式访问。

另外，映射里**不只是** `[params]` 表的内容——实测它包含标准字段（`title`、`date`、`draft`、`tags`、`weight` 等）与页面参数，全部平铺在一起。

## 什么时候用，什么时候别用

**该用**：

- 读取页面前置元数据里的自定义字段（`.Params.author.name`）；
- 遍历本页所有自定义字段（`range $k, $v := .Params`）；
- 需要对 `key` 做动态拼接时（`index .Params $key`）。

**别用**：

- 想要「页面没有就用站点配置」→ 用 [`.Param`](/methods/page/param/)；
- 想读**站点**参数 → 用 `site.Params`；
- 想读分类法或菜单 → 那是 `.GetTerms`、`.Site.Menus` 的活。

**`.Params` 与 `.Param` 对照**：

| 需求 | 用哪个 |
| --- | --- |
| 只看本页的 front matter | `.Params` |
| 页面缺失时回退到站点参数 | `.Param "key"` |
| 遍历本页全部自定义字段 | `.Params` |
| key 含连字符 | 两者都可以；`.Params` 必须用 `index` |

## 用法

举例来说，考虑下面这段前置元数据：

```toml
title = 'Annual conference'
date = 2023-10-17T15:11:37-07:00
[params]
display_related = true
key-with-hyphens = 'must use index function'
[params.author]
  email = 'jsmith@example.org'
  name = 'John Smith'
```

`title` 和 `date` 是标准的[前置元数据字段][]，其余字段则由用户自定义。

需要时，可以通过[链式](g)书写[标识符](g)来访问这些自定义字段：

```go-html-template
{{ .Params.display_related }} → true
{{ .Params.author.email }} → jsmith@example.org
{{ .Params.author.name }} → John Smith
```

在上面的模板示例中，每个 key 都是合法的标识符。例如，没有一个 key 含连字符。要访问不是合法标识符的 key，请使用 [`index`][] 函数：

```go-html-template
{{ index .Params "key-with-hyphens" }} → must use index function
```

## 完整示例：读取嵌套参数与连字符 key

测试站 `content/posts/post-1.md` 的前置元数据：

```toml
title = "第一篇"
date = 2024-01-01
weight = 10
tags = ["alpha", "beta"]
slug = "first-post"
key-with-hyphens = "must use index"
[params]
color = "red"
price = 42
[params.author]
email = "jsmith@example.org"
name = "John Smith"
```

模板：

```go-html-template {file="layouts/_default/single.html"}
<p>{{ .Params.color }}</p>
<p>{{ .Params.author.email }}</p>
<p>{{ index .Params "key-with-hyphens" }}</p>
<p>{{ .Params.price }} ({{ printf "%T" .Params.price }})</p>
```

实测（Hugo 0.167.0）渲染 `/posts/first-post/`：

```html
<p>red</p>
<p>jsmith@example.org</p>
<p>must use index</p>
<p>42 (int)</p>
```

**你应当看到什么**：`[params]` 表里的值在 `.Params` 上直接可见（不需要写 `.Params.params.color`）；`[params.author]` 变成了嵌套映射，可以链式访问；含连字符的 key 只能用 `index`；`price` 被解析成 `int`（TOML 里没加引号）。

实测 `.Params` 映射的实际内容（截取）：

```text
map[author:map[email:jsmith@example.org name:John Smith] categories:[news] color:red
 date:2024-01-01 00:00:00 +0000 UTC draft:false key-with-hyphens:must use index
 slug:first-post tags:[alpha beta] title:第一篇 weight:10]
```

**你应当看到什么**：映射里同时有自定义字段（`color`、`author`、`key-with-hyphens`）和标准字段（`title`、`date`、`draft`、`tags`、`weight`）。所以 `range .Params` 会把它们一起列出来。

## 返回值边界（实测）

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| 访问不存在的 key | 返回 `nil`（用 `with`/`default` 兜底） | 否 |
| 访问嵌套映射的字段 | 正常（实测 `.Params.author.email`） | 否 |
| 连字符 key | 必须 `index .Params "key-with-hyphens"`（实测） | 否 |
| 标准字段 | 也在映射里（`title`、`date`、`draft`、`tags`、`weight` 等，实测） | 否 |
| 会把 `[params]` 表当成一层 | 不会：`color` 直接在顶层 | 否 |
| 站点参数 | **不包含**（不会回退，这是与 `.Param` 的区别） | 否 |
| 返回类型 | `maps.Params`（可 `range`、可 `index`、可链式取值） | 否 |

更多排查入口见[故障排查](/troubleshooting/)。

[`index`]: /functions/collections/indexfunction/
[front matter fields]: /content-management/front-matter/#fields
