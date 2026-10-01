+++
title = "collections.Append"
linkTitle = "append"
description = "把单个或多个元素，或者另一个完整切片，追加到给定切片的末尾并返回新切片。"
date = 2026-10-02
weight = 30
source = "https://gohugo.io/functions/collections/append/"

[params.functions_and_methods]
returnType = "[]any"
aliases = ["append"]
+++

该函数会把除最后一个参数之外的所有元素追加到最后一个参数上。这样就可以使用下面所示的[管道](g)写法。

向切片追加单个元素：

```go-html-template
{{ $s := slice "a" "b" }}
{{ $s }} → [a b]

{{ $s = $s | append "c" }}
{{ $s }} → [a b c]
```

向切片追加两个元素：

```go-html-template
{{ $s := slice "a" "b" }}
{{ $s }} → [a b]

{{ $s = $s | append "c" "d" }}
{{ $s }} → [a b c d]
```

以切片的形式追加两个元素。结果与前一个示例相同：

```go-html-template
{{ $s := slice "a" "b" }}
{{ $s }} → [a b]

{{ $s = $s | append (slice "c" "d") }}
{{ $s }} → [a b c d]
```

从空切片开始：

```go-html-template
{{ $s := slice }}
{{ $s }} → []

{{ $s = $s | append "a" }}
{{ $s }} → [a]

{{ $s = $s | append "b" "c" }}
{{ $s }} → [a b c]

{{ $s = $s | append (slice "d" "e") }}
{{ $s }} → [a b c d e]
```

如果起始值本身是「切片的切片」：

```go-html-template
{{ $s := slice (slice "a" "b") }}
{{ $s }} → [[a b]]

{{ $s = $s | append (slice "c" "d") }}
{{ $s }} → [[a b] [c d]]
```

要从空切片开始创建「切片的切片」：

```go-html-template
{{ $s := slice }}
{{ $s }} → []

{{ $s = $s | append (slice (slice "a" "b")) }}
{{ $s }} → [[a b]]

{{ $s = $s | append (slice "c" "d") }}
{{ $s }} → [[a b] [c d]]
```

虽然上面示例中的元素都是字符串，但 `append` 函数可用于任何数据类型，包括 Page。例如，在企业站点的首页上，先显示最近两篇新闻稿的链接，再显示最近四篇文章的链接：

```go-html-template
{{ $p := where site.RegularPages "Type" "press-releases" | first 2 }}
{{ $p = $p | append (where site.RegularPages "Type" "articles" | first 4) }}

{{ with $p }}
  <ul>
    {{ range . }}
      <li><a href="{{ .RelPermalink }}">{{ .LinkTitle }}</a></li>
    {{ end }}
  </ul>
{{ end }}
```
