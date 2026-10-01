+++
title = "UTC"
linkTitle = "UTC"
description = "返回给定 time.Time 值，并把位置设为 UTC。"
date = 2026-10-02
weight = 200
source = "https://gohugo.io/methods/time/utc/"

[params.functions_and_methods]
signatures = ["TIME.UTC"]
returnType = "time.Time"
+++

```go-html-template
{{ $t := time.AsTime "2023-01-27T23:44:58-08:00" }}
{{ $t.UTC }} → 2023-01-28 07:44:58 +0000 UTC
```
