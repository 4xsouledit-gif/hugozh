+++
title = "IsZero"
linkTitle = "IsZero"
description = "报告给定 time.Time 值是否表示零时刻，即 1 年 1 月 1 日 00:00:00 UTC。"
date = 2026-10-02
weight = 110
source = "https://gohugo.io/methods/time/iszero/"

[params.functions_and_methods]
signatures = ["TIME.IsZero"]
returnType = "bool"
+++

```go-html-template
{{ $t1 := time.AsTime "2023-01-01T00:00:00-08:00" }}
{{ $t2 := time.AsTime "0001-01-01T00:00:00-00:00" }}

{{ $t1.IsZero }} → false
{{ $t2.IsZero }} → true
```
