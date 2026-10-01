+++
title = "collections.Last"
linkTitle = "last"
description = "返回给定切片或字符串的最后 N 个元素。"
date = 2026-10-02
weight = 160
source = "https://gohugo.io/functions/collections/last/"

[params.functions_and_methods]
signatures = ["collections.Last N SLICE|STRING"]
returnType = "any"
aliases = ["last"]
+++

```go-html-template
{{ slice "a" "b" "c" | last 1 }} → [c]
{{ slice "a" "b" "c" | last 2 }} → [b c]
```

由于字符串实际上就是只读的字节切片，该函数可用于返回字符串末尾指定数量的字节：

```go-html-template
{{ "abc" | last 1 }} → c
{{ "abc" | last 2 }} → bc
```

注意一个_字符_可能由多个_字节_组成：

```go-html-template
{{ "Schön" | last 1 }} → n
{{ "Schön" | last 2 }} → \xb6n
{{ "Schön" | last 3 }} → ön
```

要在页面集合上使用 `collections.Last` 函数：

```go-html-template
{{ range last 5 .Pages }}
  {{ .Render "summary" }}
{{ end }}
```

把 `N` 设为 0 可返回空切片：

```go-html-template
{{ $emptyPageCollection := last 0 .Pages }}
```

`last` 与 [`where`][] 一起使用：

```go-html-template
{{ range where .Pages "Section" "articles" | last 5 }}
  {{ .Render "summary" }}
{{ end }}
```

[`where`]: /functions/collections/where/
