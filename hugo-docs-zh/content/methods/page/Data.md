+++
title = "Data"
linkTitle = "Data"
description = "为每种页面种类返回各自特有的数据对象。"
date = 2026-10-02
weight = 110
source = "https://gohugo.io/methods/page/data/"

[params.functions_and_methods]
signatures = ["PAGE.Data"]
returnType = "page.Data"
+++

`Page` 对象上的 `Data` 方法为每种[页面种类](g)返回各自特有的数据对象。

> [!NOTE]
> `Data` 方法只在[分类法](g)模板与[术语](g)模板中有用。
>
> 维护不活跃的主题可能仍在模板里使用 `.Data.Pages`。这种写法虽然还能用，但请改用下列方法之一：[`Pages`][]、[`RegularPages`][] 或 [`RegularPagesRecursive`][]

下面的示例基于如下项目配置：

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

## 在分类法模板中

在*分类法*模板中的 `Data` 对象上使用这些方法。

`Singular`
: （`string`）返回分类法的单数名称。

```go-html-template
{{ .Data.Singular }} → genre
```

`Plural`
: （`string`）返回分类法的复数名称。

```go-html-template
{{ .Data.Plural }} → genres
```

`Terms`
: （`page.Taxonomy`）返回 `Taxonomy` 对象，它由术语映射以及各术语关联的[加权页面](g)组成。

```go-html-template
{{ $taxonomyObject := .Data.Terms }}
```

> [!NOTE]
> 取得 `Taxonomy` 对象之后，可以用任何[分类法方法][]对它的加权页面排序、计数，或取出其中一部分。

进一步了解[分类法模板][]。

## 在术语模板中

在*术语*模板中的 `Data` 对象上使用这些方法。

`Singular`
: （`string`）返回分类法的单数名称。

```go-html-template
{{ .Data.Singular }} → genre
```

`Plural`
: （`string`）返回分类法的复数名称。

```go-html-template
{{ .Data.Plural }} → genres
```

`Term`
: （`string`）返回术语名称。

```go-html-template
{{ .Data.Term }} → suspense
```

进一步了解[术语模板][]。

[`Pages`]: /methods/page/pages/
[`RegularPagesRecursive`]: /methods/page/regularpagesrecursive/
[`RegularPages`]: /methods/page/regularpages/
[分类法方法]: /methods/taxonomy/
[分类法模板]: /templates/types/#taxonomy
[术语模板]: /templates/types/#term
