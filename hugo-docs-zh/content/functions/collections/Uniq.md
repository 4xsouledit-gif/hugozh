+++
title = "collections.Uniq"
linkTitle = "uniq"
description = "去掉给定切片中的重复元素后返回。"
date = 2026-10-02
weight = 270
source = "https://gohugo.io/functions/collections/uniq/"

[params.functions_and_methods]
signatures = ["collections.Uniq SLICE"]
returnType = "[]any"
aliases = ["uniq"]
+++

```go-html-template
{{ slice 1 3 2 1 | uniq }} → [1 3 2]
```
