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
