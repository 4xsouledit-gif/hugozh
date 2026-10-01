+++
title = "collections.Index"
linkTitle = "index"
description = "按指定的一个或多个 key，从给定的切片或映射中取出元素或值。"
date = 2026-10-02
weight = 120
source = "https://gohugo.io/functions/collections/indexfunction/"

[params.functions_and_methods]
signatures = ["collections.Index SLICE|MAP KEY..."]
returnType = "any"
aliases = ["index"]
+++

被索引的每一项都必须是映射或切片：

```go-html-template
{{ $s := slice "a" "b" "c" }}
{{ index $s 0 }} → a
{{ index $s 1 }} → b

{{ $m := dict "a" 100 "b" 200 }}
{{ index $m "b" }} → 200
```

使用两个或更多 key 可访问嵌套值：

```go-html-template
{{ $m := dict "a" 100 "b" 200 "c" (slice 10 20 30) }}
{{ index $m "c" 1 }} → 20

{{ $m := dict "a" 100 "b" 200 "c" (dict "d" 10 "e" 20) }}
{{ index $m "c" "e" }} → 20
```

也可以用一个由 key 组成的切片来访问嵌套值：

```go-html-template
{{ $m := dict "a" 100 "b" 200 "c" (dict "d" 10 "e" 20) }}
{{ $s := slice "c" "e" }}
{{ index $m $s }} → 20
```

当 key 是变量时，用 `collections.Index` 函数访问嵌套值。例如下面两种写法等价：

```go-html-template
{{ .Site.Params.foo }}

{{ $k := "foo" }}
{{ index .Site.Params $k }}
```
