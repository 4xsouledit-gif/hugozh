+++
title = "Count"
linkTitle = "Count"
description = "返回给定术语所关联的加权页面数量。"
date = 2026-10-02
weight = 40
source = "https://gohugo.io/methods/taxonomy/count/"

[params.functions_and_methods]
signatures = ["TAXONOMY.Count TERM"]
returnType = "int"
+++

## 这一页解决什么问题

`Count` 回答一个很具体的问题：**某个术语下有多少页面**。它常用于标签云里跟在术语后面的数字「suspense (3)」，或在侧栏显示每个主题的文章数。

它只接受一个术语名参数并返回整数——不返回页面，也不返回术语列表。

## 什么时候用，什么时候别用

**该用**：

- 需要**单个**术语的计数（尤其是术语名来自变量时）；
- 遍历有序分类法时，元素上也有 `.Count`，那是最省事的写法（[Alphabetical](/methods/taxonomy/alphabetical/) / [ByCount](/methods/taxonomy/bycount/)）。

**别用**：

- 需要术语下的页面列表 → 用 [`Get`](/methods/taxonomy/get/)；
- 需要按计数排序的术语列表 → 用 [`ByCount`](/methods/taxonomy/bycount/)；
- 用它判断「术语是否存在」→ **不存在的术语返回 `0`**（实测），与「存在但没有页面」无法区分；要与 `len` 或 `with` 配合判断对象本身。

## 用法

`Taxonomy` 对象上的 `Count` 方法返回给定 [term](g)（术语）所关联的 [weighted pages](g)（加权页面）数量。

在使用 `Taxonomy` 方法之前，需要先取得一个 `Taxonomy` 对象。

## 取得 Taxonomy 对象

考虑如下项目配置：

```toml
[taxonomies]
genre = 'genres'
author = 'authors'
```

内容结构如下：

```tree
content/
├── books/
│   ├── and-then-there-were-none.md --> genres: suspense
│   ├── death-on-the-nile.md        --> genres: suspense
│   └── jamaica-inn.md              --> genres: suspense, romance
│   └── pride-and-prejudice.md      --> genres: romance
└── _index.md
```

要在任何模板中取得 “genres” `Taxonomy` 对象，请使用 `Site` 对象上的 [`Taxonomies`][] 方法。

```go-html-template
{{ $taxonomyObject := .Site.Taxonomies.genres }}
```

若要在渲染分类法页面时用 _taxonomy_ 模板取得 “genres” `Taxonomy` 对象，请使用页面 [`Data`][] 对象上的 [`Terms`][] 方法：

```go-html-template {file="layouts/taxonomy.html"}
{{ $taxonomyObject := .Data.Terms }}
```

要查看数据结构：

```go-html-template
<pre>{{ debug.Dump $taxonomyObject }}</pre>
```

虽然 [`Alphabetical`][] 与 [`ByCount`][] 方法提供了更适合遍历分类法的数据结构，你也可以直接从 `Taxonomy` 对象按术语渲染加权页面：

```go-html-template
{{ range $term, $weightedPages := $taxonomyObject }}
  <h2><a href="{{ .Page.RelPermalink }}">{{ .Page.LinkTitle }}</a></h2>
  <ul>
    {{ range $weightedPages }}
      <li><a href="{{ .RelPermalink }}">{{ .LinkTitle }}</a></li>
    {{ end }}
  </ul>
{{ end }}
```

在上例中，第一个锚元素是指向术语页面的链接。

[`Alphabetical`]: /methods/taxonomy/alphabetical/
[`ByCount`]: /methods/taxonomy/bycount/
[`Data`]: /methods/page/data/
[`Taxonomies`]: /methods/site/taxonomies/
[`Terms`]: /methods/page/data/#in-a-taxonomy-template

## 统计加权页面数量

现在我们已经取得了 `genres` `Taxonomy` 对象，接下来统计 `suspense` 术语所关联的加权页面数量：

```go-html-template
{{ $taxonomyObject.Count "suspense" }} → 3
```

## 完整示例（实测）

四本书的 `genres` 分别为 suspense、suspense、suspense+romance、romance（即 suspense 3 本、romance 2 本）。分类法模板 `layouts/taxonomy.html`（渲染 `/genres/`）：

```go-html-template {file="layouts/taxonomy.html"}
{{ $taxonomyObject := .Data.Terms }}
<p>suspense：{{ $taxonomyObject.Count "suspense" }}</p>
<p>romance：{{ $taxonomyObject.Count "romance" }}</p>
<p>拼错的术语：{{ $taxonomyObject.Count "suspence" }}</p>
```

Hugo 渲染为：

```html
<p>suspense：3</p>
<p>romance：2</p>
<p>拼错的术语：0</p>
```

在**空分类法**页面上（`tags` 已配置但没有任何内容使用它，页面 `/tags/` 由 `layouts/taxonomy.html` 渲染）：

```html
<p>suspense：0</p>
<p>romance：0</p>
<p>拼错的术语：0</p>
```

**你应当看到什么**：计数来自术语所关联的**页面数**（`suspense` 3、`romance` 2）；拼错术语不会报错，只会得到 `0`——空分类法上任何查询也都是 `0`。所以「显示 0」既可能是拼错，也可能确实是空，排查时先打印术语名列表：`{{ range $taxonomyObject.Alphabetical }}{{ .Term }}|{{ end }}`。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，`genres` 的 suspense 3 本、romance 2 本；另有空分类法 `tags`，Windows。

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| `Count "suspense"` | `3` | 否 |
| `Count "romance"` | `2` | 否 |
| 术语不存在（如 `"suspence"`） | `0` | 否 |
| 空分类法上任意术语 | `0` | 否 |
| 术语名大小写 | 按术语 slug 匹配；`"Suspense"` 与 `"suspense"` 是否等价本站未单独实测，建议统一用小写 | —— |
| 返回值类型 | `int` | 否 |
| 有序分类法元素上的 `.Count` | 与 `Count "<term>"` 数值一致（实测元素输出 `romance/2`、`suspense/3`） | 否 |
