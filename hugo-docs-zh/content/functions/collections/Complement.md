+++
title = "collections.Complement"
linkTitle = "complement"
description = "找出只出现在最后一个给定切片中、而不出现在前面任何切片中的元素，返回这些元素组成的切片。"
date = 2026-10-02
weight = 50
source = "https://gohugo.io/functions/collections/complement/"

[params.functions_and_methods]
signatures = ["collections.Complement SLICE [SLICE...]"]
returnType = "[]any"
aliases = ["complement"]
+++

要找出存在于 `$c3` 但不存在于 `$c1` 或 `$c2` 中的元素：

```go-html-template
{{ $c1 := slice 3 }}
{{ $c2 := slice 4 5 }}
{{ $c3 := slice 1 2 3 4 5 }}

{{ complement $c1 $c2 $c3 }} → [1 2]
```

> [!NOTE]
> 使用[链式管道][chained pipeline]可以让代码更易理解：

```go-html-template
{{ $c3 | complement $c1 $c2 }} → [1 2]
```

`complement` 函数也可以用于页面集合。假设你的站点有五种内容类型：

```tree
content/
├── blog/
├── books/
├── faqs/
├── films/
└── songs/
```

要列出除博客文章（`blog`）和常见问题（`faqs`）之外的所有内容：

```go-html-template
{{ $blog := where site.RegularPages "Type" "blog" }}
{{ $faqs := where site.RegularPages "Type" "faqs" }}
{{ range site.RegularPages | complement $blog $faqs }}
  <a href="{{ .RelPermalink }}">{{ .LinkTitle }}</a>
{{ end }}
```

> [!NOTE]
> 虽然上面的示例演示的是 `complement` 函数，但你同样可以使用 [`where`][] 函数：

```go-html-template
{{ range where site.RegularPages "Type" "not in" (slice "blog" "faqs") }}
  <a href="{{ .RelPermalink }}">{{ .LinkTitle }}</a>
{{ end }}
```

在这个示例中，我们用 `complement` 函数从句子中移除[停用词][stop words]：

```go-html-template
{{ $text := "The quick brown fox jumps over the lazy dog" }}
{{ $stopWords := slice "a" "an" "in" "over" "the" "under" }}
{{ $filtered := split $text " " | complement $stopWords }}

{{ delimit $filtered " " }} → The quick brown fox jumps lazy dog
```

[`where`]: /functions/collections/where/
[chained pipeline]: https://pkg.go.dev/text/template#hdr-Pipelines
[stop words]: https://en.wikipedia.org/wiki/Stop_word
