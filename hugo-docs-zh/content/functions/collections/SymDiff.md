+++
title = "collections.SymDiff"
linkTitle = "symdiff"
description = "返回两个给定切片的对称差集（symmetric difference）。"
date = 2026-10-02
weight = 250
source = "https://gohugo.io/functions/collections/symdiff/"

[params.functions_and_methods]
signatures = ["SLICE1 | collections.SymDiff SLICE2"]
returnType = "[]any"
aliases = ["symdiff"]
+++

示例：

```go-html-template
{{ slice 1 2 3 | symdiff (slice 3 4) }} → [1 2 4]
```

另见 <https://en.wikipedia.org/wiki/Symmetric_difference>。
