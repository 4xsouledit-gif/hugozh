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

## 这一页解决什么问题

`Get` 按**术语名**取回该术语下的**加权页面切片**——也就是「这个标签下有哪些文章」。它和直接写 `$taxonomyObject.suspense` 等价，但胜在术语名可以来自变量、可以含连字符。

拿到切片后就能 `range`、`len`，或继续交给页面集合的排序方法处理。

## 什么时候用，什么时候别用

**该用**：

- 术语名是**变量**（循环、参数）或含连字符、句点等不能写在点号后的字符；
- 需要「某术语下的全部页面」，且顺序按分类法权重即可。

**别用**：

- 术语名是合法[标识符](g)且写死在模板里 → `$taxonomyObject.suspense` 更短；
- 想数数量 → 用 [`Count`](/methods/taxonomy/count/)；
- 想遍历所有术语 → 用 [`Alphabetical`](/methods/taxonomy/alphabetical/) / [`ByCount`](/methods/taxonomy/bycount/)（`Get` 只查一个术语）；
- 忘了兜底：术语不存在时返回**空切片**（不报错），`range` 静默无输出，容易被当成「这个标签没文章」。

## 用法

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

## 完整示例（实测）

`suspense` 关联 3 本书，`romance` 关联 2 本。分类法模板 `layouts/taxonomy.html`（渲染 `/genres/`）：

```go-html-template {file="layouts/taxonomy.html"}
{{ $taxonomyObject := .Data.Terms }}
{{ $weightedPages := $taxonomyObject.Get "suspense" }}
<p>共 {{ len $weightedPages }} 本</p>
{{ range $weightedPages }}
  <h2><a href="{{ .RelPermalink }}">{{ .LinkTitle }}</a></h2>
{{ end }}

<p>不存在的术语：[{{ range $taxonomyObject.Get "nope" }}x{{ end }}]</p>
<p>index 等价写法：{{ range index $taxonomyObject "suspense" }}{{ .Title }}|{{ end }}</p>
```

Hugo 渲染为（`range` 的空白已省略）：

```html
<p>共 3 本</p>

  <h2><a href="/books/jamaica-inn/">Jamaica Inn</a></h2>

  <h2><a href="/books/death-on-the-nile/">Death on the Nile</a></h2>

  <h2><a href="/books/and-then-there-were-none/">And Then There Were None</a></h2>

<p>不存在的术语：[]</p>
<p>index 等价写法：Jamaica Inn|Death on the Nile|And Then There Were None|</p>
```

**你应当看到什么**：`Get` 返回的是**加权页面**，顺序按其分类法权重（本实测里是 `Jamaica Inn`、`Death on the Nile`、`And Then There Were None`）；不存在的术语得到**空切片**，所以 `[]` 里什么都没有；`index $taxonomyObject "术语"` 得到同样结果——术语名含连字符时就用它。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，`genres` 的 suspense 3 本、romance 2 本，Windows。

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| `Get "suspense"` | 3 项的加权页面切片，可 `range`、`len` | 否 |
| 术语不存在（`Get "nope"`） | 空切片（`len` → 0），`range` 无输出 | 否 |
| `index $taxonomyObject "suspense"` | 与 `Get` 等价（实测同样输出 3 个标题） | 否 |
| 术语名是合法标识符时的链式写法 | `$taxonomyObject.suspense` 等价 | 否 |
| 术语名含连字符时的链式写法 | —— | 是：模板**解析**阶段报 `bad character U+002D '-'`（实测），连字符不能用点号访问 |
| 返回值类型 | `page.WeightedPages`（`page.Pages` 的排序方法对它同样可用） | 否 |
| 有序分类法元素上的 `.WeightedPages` | 与该术语 `Get` 的结果对应 | 否 |

[`index`]: /functions/collections/indexfunction/
