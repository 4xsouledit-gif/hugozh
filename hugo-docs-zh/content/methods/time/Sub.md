+++
title = "Sub"
linkTitle = "Sub"
description = "返回 TIME1 减去 TIME2 所得的时长。"
date = 2026-10-02
weight = 180
source = "https://gohugo.io/methods/time/sub/"

[params.functions_and_methods]
signatures = ["TIME1.Sub TIME2"]
returnType = "time.Duration"
+++

```go-html-template
{{ $t1 := time.AsTime "2023-01-27T23:44:58-08:00" }}
{{ $t2 := time.AsTime "2023-01-26T22:34:38-08:00" }}

{{ $t1.Sub $t2 }} → 25h10m20s
```
