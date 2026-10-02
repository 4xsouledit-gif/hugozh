+++
title = "ByCount"
linkTitle = "ByCount"
description = "返回按各术语关联页面数量排序的有序分类法。"
date = 2026-10-02
weight = 30
source = "https://gohugo.io/methods/taxonomy/bycount/"

[params.functions_and_methods]
signatures = ["TAXONOMY.ByCount"]
returnType = "page.OrderedTaxonomy"
+++

## 这一页解决什么问题

`ByCount` 把 `Taxonomy` 映射转成**按术语关联页面数量排序**的有序切片——数量相同时再按术语的字母序。它要解决的是「标签云」这类需求：用得最多的术语排在最前面。

它和 [`Alphabetical`](/methods/taxonomy/alphabetical/) 是同一个数据结构的两种排序：元素内容完全一样，只有顺序不同。

## 什么时候用，什么时候别用

**该用**：

- 标签云、热门主题列表（按数量降序）；
- 想让「内容多的术语」优先出现，而不是按字母。

**别用**：

- 想按字母序 → 用 [`Alphabetical`](/methods/taxonomy/alphabetical/)；
- 只想数一个术语 → 用 [`Count`](/methods/taxonomy/count/)；
- 只想取某术语的页面 → 用 [`Get`](/methods/taxonomy/get/)；
- 想按**页面日期**排术语 → `ByCount` 只按计数；术语内部再排序请用元素上的 `.Pages`（见下文）。

## 用法

`Taxonomy` 对象上的 `ByCount` 方法返回一个 [ordered taxonomy](g)（有序分类法），按各 [term](g)（术语）所关联的页面数量排序；数量相同时再按术语的字母序排序。

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

现在我们已经取得了 “genres” `Taxonomy` 对象，接下来取得按各术语所关联页面数量排序的有序分类法：

```go-html-template
{{ $taxonomyObject.ByCount }}
```

要反转排序顺序：

```go-html-template
{{ $taxonomyObject.ByCount.Reverse }}
```

要查看数据结构：

```go-html-template
<pre>{{ debug.Dump $taxonomyObject.ByCount }}</pre>
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
{{ range $taxonomyObject.ByCount }}
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
<h2><a href="/genres/suspense/">suspense</a> (3)</h2>
<ul>
  <li><a href="/books/and-then-there-were-none/">And then there were none</a></li>
  <li><a href="/books/death-on-the-nile/">Death on the nile</a></li>
  <li><a href="/books/jamaica-inn/">Jamaica inn</a></li>
</ul>
<h2><a href="/genres/romance/">romance</a> (2)</h2>
<ul>
  <li><a href="/books/jamaica-inn/">Jamaica inn</a></li>
  <li><a href="/books/pride-and-prejudice/">Pride and prejudice</a></li>
</ul>
```

## 完整示例（实测）

与上游相同的术语分配（suspense 3 本、romance 2 本）。分类法模板 `layouts/taxonomy.html`（渲染 `/genres/`）：

```go-html-template {file="layouts/taxonomy.html"}
{{ $taxonomyObject := .Data.Terms }}
<p>按计数：{{ range $taxonomyObject.ByCount }}{{ .Term }}={{ .Count }}|{{ end }}</p>
<p>反转：{{ range $taxonomyObject.ByCount.Reverse }}{{ .Term }}|{{ end }}</p>
{{ range $taxonomyObject.ByCount }}
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
<p>按计数：suspense=3|romance=2|</p>
<p>反转：romance|suspense|</p>

  <h2><a href="/genres/suspense/">Suspense</a> (3)</h2>
  <ul>
      <li><a href="/books/and-then-there-were-none/">And Then There Were None</a></li>
      <li><a href="/books/death-on-the-nile/">Death on the Nile</a></li>
      <li><a href="/books/jamaica-inn/">Jamaica Inn</a></li>
  </ul>

  <h2><a href="/genres/romance/">Romance</a> (2)</h2>
  <ul>
      <li><a href="/books/jamaica-inn/">Jamaica Inn</a></li>
      <li><a href="/books/pride-and-prejudice/">Pride and Prejudice</a></li>
  </ul>
```

**你应当看到什么**：同一份数据，`ByCount` 把 `suspense`（3 本）排在 `romance`（2 本）前，而 [`Alphabetical`](/methods/taxonomy/alphabetical/) 会把 `romance` 排前面。`.Reverse` 得到的是**升序**（数量少的在前）——如果要做「最少使用的术语」，它比手写排序方便。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，`genres` 有 2 个术语（计数 3 与 2），Windows。

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| `.Data.Terms.ByCount` | 有序切片（`page.OrderedTaxonomy`），按计数降序 | 否 |
| `.ByCount.Reverse` | 顺序相反（实测 `romance\|suspense`） | 否 |
| 计数相同时 | 再按术语字母序（上游说明） | 否 |
| 元素字段 | `.Term`、`.Count`、`.Page`、`.Pages`、`.WeightedPages` 均可用 | 否 |
| 空分类法（无术语） | 空切片，`range` 无输出，不报错 | 否 |
| 计数含义 | 是该术语关联的**页面数**，不是术语数；`len $taxonomyObject` 才是术语数 | 否 |
