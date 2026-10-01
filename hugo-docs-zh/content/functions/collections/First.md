+++
title = "collections.First"
linkTitle = "first"
description = "返回给定切片或字符串的前 N 个元素。"
date = 2026-10-02
weight = 90
source = "https://gohugo.io/functions/collections/first/"

[params.functions_and_methods]
signatures = ["collections.First N SLICE|STRING"]
returnType = "any"
aliases = ["first"]
+++

```go-html-template
{{ slice "a" "b" "c" | first 1 }} → [a]
{{ slice "a" "b" "c" | first 2 }} → [a b]
```

由于字符串实际上就是只读的字节切片，该函数可用于返回字符串开头指定数量的字节：

```go-html-template
{{ "abc" | first 1 }} → a
{{ "abc" | first 2 }} → ab
```

注意一个_字符_可能由多个_字节_组成：

```go-html-template
{{ "Schön" | first 3 }} → Sch
{{ "Schön" | first 4 }} → Sch\xc3
{{ "Schön" | first 5 }} → Schö
```

要在页面集合上使用 `collections.First` 函数：

```go-html-template
{{ range first 5 .Pages }}
  {{ .Render "summary" }}
{{ end }}
```

把 `N` 设为 0 可返回空切片：

```go-html-template
{{ $emptyPageCollection := first 0 .Pages }}
```

`first` 与 [`where`][] 一起使用：

```go-html-template
{{ range where .Pages "Section" "articles" | first 5 }}
  {{ .Render "summary" }}
{{ end }}
```

[`where`]: /functions/collections/where/
