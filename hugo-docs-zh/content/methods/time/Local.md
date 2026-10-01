+++
title = "Local"
linkTitle = "Local"
description = "返回给定 time.Time 值，并把位置设为本地时间。"
date = 2026-10-02
weight = 120
source = "https://gohugo.io/methods/time/local/"

[params.functions_and_methods]
signatures = ["TIME.Local"]
returnType = "time.Time"
+++

```go-html-template
{{ $t := time.AsTime "2023-01-28T07:44:58+00:00" }}
{{ $t.Local }} → 2023-01-27 23:44:58 -0800 PST
```
