+++
title = "Get"
linkTitle = "Get"
description = "返回给定术语所关联的加权页面切片。"
date = 2026-10-02
weight = 50
source = "https://gohugo.io/methods/taxonomy/get/"

[params.functions_and_methods]
signatures = ["TAXONOMY.Get TERM"]
returnType = "page.WeightedPages"
+++

`Taxonomy` 对象上的 `Get` 方法返回给定 [term](g)（术语）所关联的 [weighted pages](g)（加权页面）切片。

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

## 取得加权页面

现在我们已经取得了 `genres` `Taxonomy` 对象，接下来取得 `suspense` 术语所关联的加权页面：

```go-html-template
{{ $weightedPages := $taxonomyObject.Get "suspense" }}
```

上面的写法等价于：

```go-html-template
{{ $weightedPages := $taxonomyObject.suspense }}
```

如果术语不是合法的 [identifier](g)（标识符），就不能使用 [chain](g)（链式）语法。例如下面的写法会抛出错误，因为标识符中含有连字符：

```go-html-template
{{ $weightedPages := $taxonomyObject.my-genre }}
```

你也可以使用 [`index`][] 函数，但语法更啰嗦：

```go-html-template
{{ $weightedPages := index $taxonomyObject "my-genre" }}
```

要查看数据结构：

```go-html-template
<pre>{{ debug.Dump $weightedPages }}</pre>
```

## 示例

使用如下模板：

```go-html-template
{{ $weightedPages := $taxonomyObject.Get "suspense" }}
{{ range $weightedPages }}
  <h2><a href="{{ .RelPermalink }}">{{ .LinkTitle }}</a></h2>
{{ end }}
```

Hugo 渲染结果：

```html
<h2><a href="/books/jamaica-inn/">Jamaica inn</a></h2>
<h2><a href="/books/death-on-the-nile/">Death on the nile</a></h2>
<h2><a href="/books/and-then-there-were-none/">And then there were none</a></h2>
```

[`index`]: /functions/collections/indexfunction/
