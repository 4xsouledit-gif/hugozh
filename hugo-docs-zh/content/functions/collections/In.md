+++
title = "collections.In"
linkTitle = "in"
description = "报告某个值是否存在于给定的切片或字符串中。"
date = 2026-10-02
weight = 110
source = "https://gohugo.io/functions/collections/in/"

[params.functions_and_methods]
signatures = ["collections.In SLICE|STRING VALUE"]
returnType = "bool"
aliases = ["in"]
+++

```go-html-template
{{ $s := slice "a" "b" "c" }}
{{ in $s "b" }} → true
```

```go-html-template
{{ $s := "abc" }}
{{ in $s "b" }} → true
```
