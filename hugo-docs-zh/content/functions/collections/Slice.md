+++
title = "collections.Slice"
linkTitle = "slice"
description = "根据给定的值创建一个切片。"
date = 2026-10-02
weight = 230
source = "https://gohugo.io/functions/collections/slice/"

[params.functions_and_methods]
signatures = ["collections.Slice [VALUE...]"]
returnType = "[]any"
aliases = ["slice"]
+++

```go-html-template
{{ $s := slice "a" "b" "c" }}
{{ $s }} → [a b c]
```

要创建空切片：

```go-html-template
{{ $s := slice }}
```
