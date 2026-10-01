+++
title = "Add"
linkTitle = "Add"
description = "返回给定时间加上给定时长后的时间。"
date = 2026-10-02
weight = 20
source = "https://gohugo.io/methods/time/add/"

[params.functions_and_methods]
signatures = ["TIME.Add DURATION"]
returnType = "time.Time"
+++

```go-html-template
{{ $t := time.AsTime "2023-01-27T23:44:58-08:00" }}

{{ $d1 = time.ParseDuration "3h20m10s" }}
{{ $d2 = time.ParseDuration "-3h20m10s" }}

{{ $t.Add $d1 }} → 2023-01-28 03:05:08 -0800 PST
{{ $t.Add $d2 }} → 2023-01-27 20:24:48 -0800 PST
```
