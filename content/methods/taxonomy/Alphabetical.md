+++
title = "Alphabetical"
linkTitle = "Alphabetical"
description = "返回按术语字母序排序的有序分类法。"
date = 2026-10-02
weight = 20
source = "https://gohugo.io/methods/taxonomy/alphabetical/"

[params.functions_and_methods]
signatures = ["TAXONOMY.Alphabetical"]
returnType = "page.OrderedTaxonomy"
+++

## 这一页解决什么问题

`Taxonomy` 对象本身是**映射**，`range` 出来的顺序不保证（Hugo 也提供不了「按字母」之外的直接控制）。`Alphabetical` 把这张映射转成**有序切片**：每个元素带术语名、计数、术语页面和该术语的页面集合，顺序按术语的字母序。

最典型的需求是「术语列表 / 标签云但按字母排」，或者做术语索引（A–Z 目录）。

## 什么时候用，什么时候别用

**该用**：

- 术语列表要**可预测的顺序**（字母序）；
- 想拿到「术语 + 计数 + 术语页面 + 页面集合」这套结构化元素（切片元素的方法见下文「取得有序分类法」）。

**别用**：

- 想按**页面数量**排序 → 用 [`ByCount`](/methods/taxonomy/bycount/)；
- 只想拿某个术语的页面 → 用 [`Get`](/methods/taxonomy/get/)（更直接，不必先转切片）；
- 只想数某个术语 → 用 [`Count`](/methods/taxonomy/count/)；
- 只想列出分类法的键 → [`Site.Taxonomies`](/methods/site/taxonomies/) 即可。

## 用法

`Taxonomy` 对象上的 `Alphabetical` 方法返回一个 [ordered taxonomy](g)（有序分类法），按 [term](g)（术语）的字母序排序。

`Taxonomy` 对象是 [map](g)（映射），而有序分类法是一个 [slice](g)（切片），其中每个元素都是一个对象，包含术语以及该术语的 [weighted pages](g)（加权页面）切片。

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

## 取得有序分类法

现在我们已经取得了 “genres” `Taxonomy` 对象，接下来取得按术语字母序排序的有序分类法：

```go-html-template
{{ $taxonomyObject.Alphabetical }}
```

要反转排序顺序：

```go-html-template
{{ $taxonomyObject.Alphabetical.Reverse }}
```

要查看数据结构：

```go-html-template
<pre>{{ debug.Dump $taxonomyObject.Alphabetical }}</pre>
```

有序分类法是一个切片，其中每个元素都是一个对象，包含术语以及该术语的加权页面切片。

切片的每个元素都提供以下方法：

`Count`
: （`int`）返回该术语所关联的页面数量。

`Page`
: （`page.Page`）返回该术语的 `Page` 对象，便于链接到术语页面。

`Pages`
: （`page.Pages`）返回一个 `Pages` 对象，其中包含该术语所关联的 `Page` 对象，按 [taxonomic weight](g)（分类法权重）排序。若要排序或分组，可使用 `Pages` 对象可用的任何[方法][]。例如按最后修改日期排序。

`Term`
: （`string`）返回术语名称。

`WeightedPages`
: （`page.WeightedPages`）返回该术语所关联的加权页面切片，按分类法权重排序。上面的 `Pages` 方法更灵活，可以排序和分组。

[方法]: /methods/pages/

## 示例

使用如下模板：

```go-html-template
{{ range $taxonomyObject.Alphabetical }}
  <h2><a href="{{ .Page.RelPermalink }}">{{ .Page.LinkTitle }}</a> ({{ .Count }})</h2>
  <ul>
    {{ range .Pages.ByTitle }}
      <li><a href="{{ .RelPermalink }}">{{ .Title }}</a></li>
    {{ end }}
  </ul>
{{ end }}
```

Hugo 渲染结果：

```html
<h2><a href="/genres/romance/">romance</a> (2)</h2>
<ul>
  <li><a href="/books/jamaica-inn/">Jamaica inn</a></li>
  <li><a href="/books/pride-and-prejudice/">Pride and prejudice</a></li>
</ul>
<h2><a href="/genres/suspense/">suspense</a> (3)</h2>
<ul>
  <li><a href="/books/and-then-there-were-none/">And then there were none</a></li>
  <li><a href="/books/death-on-the-nile/">Death on the nile</a></li>
  <li><a href="/books/jamaica-inn/">Jamaica inn</a></li>
</ul>
```

## 完整示例（实测）

我用与上游相同的术语分配实测（suspense 3 本、romance 2 本）：`hugo.toml` 里 `genre = 'genres'`，四本书的 `genres` 分别为 `['suspense']`、`['suspense']`、`['suspense','romance']`、`['romance']`。分类法模板 `layouts/taxonomy.html`（渲染 `/genres/`）：

```go-html-template {file="layouts/taxonomy.html"}
{{ $taxonomyObject := .Data.Terms }}
<p>字母序：{{ range $taxonomyObject.Alphabetical }}{{ .Term }}={{ .Count }}|{{ end }}</p>
<p>反转：{{ range $taxonomyObject.Alphabetical.Reverse }}{{ .Term }}|{{ end }}</p>
{{ range $taxonomyObject.Alphabetical }}
  <h2><a href="{{ .Page.RelPermalink }}">{{ .Page.LinkTitle }}</a> ({{ .Count }})</h2>
  <ul>
    {{ range .Pages.ByTitle }}
      <li><a href="{{ .RelPermalink }}">{{ .Title }}</a></li>
    {{ end }}
  </ul>
{{ end }}
```

Hugo 渲染为（`range` 的空白已省略）：

```html
<p>字母序：romance=2|suspense=3|</p>
<p>反转：suspense|romance|</p>

  <h2><a href="/genres/romance/">Romance</a> (2)</h2>
  <ul>
      <li><a href="/books/jamaica-inn/">Jamaica Inn</a></li>
      <li><a href="/books/pride-and-prejudice/">Pride and Prejudice</a></li>
  </ul>

  <h2><a href="/genres/suspense/">Suspense</a> (3)</h2>
  <ul>
      <li><a href="/books/and-then-there-were-none/">And Then There Were None</a></li>
      <li><a href="/books/death-on-the-nile/">Death on the Nile</a></li>
      <li><a href="/books/jamaica-inn/">Jamaica Inn</a></li>
  </ul>
```

**你应当看到什么**：`Alphabetical` 让 `romance` 排在 `suspense` 前（字母序），而 `.Reverse` 一下就能得到 Z→A。元素上的 `.Pages.ByTitle` 是**再排一层**：术语内部按标题字母序（`Jamaica Inn` 在 `Pride and Prejudice` 前），与术语之间的字母序是两件独立的事。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，`genres` 有 2 个术语，Windows。

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| `.Data.Terms.Alphabetical` | 有序切片（`returnType` 为 `page.OrderedTaxonomy`），可 `range` | 否 |
| `.Alphabetical.Reverse` | 同为有序切片，顺序相反 | 否 |
| 元素字段 | `.Term`、`.Count`、`.Page`、`.Pages`、`.WeightedPages` 均可用（实测 `romance/2/Romance/2/2`） | 否 |
| 空分类法（如 `/tags/`，无术语） | 空切片：`range` 不产生任何输出，也不报错 | 否 |
| 与 `ByCount` 的差别 | 同一数据实测 `Alphabetical` → `romance=2\|suspense=3`，`ByCount` → `suspense=3\|romance=2` | 否 |
| 术语名大小写 | 排序按术语名（Hugo 会小写化术语 slug），显示名取 `.Page.LinkTitle` | 否 |
