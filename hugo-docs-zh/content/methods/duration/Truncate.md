+++
title = "Truncate"
linkTitle = "Truncate"
description = "返回把 DURATION1 向零方向截断到 DURATION2 整数倍后的结果。"
date = 2026-10-02
weight = 90
source = "https://gohugo.io/methods/duration/truncate/"

[params.functions_and_methods]
signatures = ["DURATION1.Truncate DURATION2"]
returnType = "time.Duration"
+++

```go-html-template
{{ $d = time.ParseDuration "3.5h2.5m1.5s" }}

{{ $d.Truncate (time.ParseDuration "2h") }} → 2h0m0s
{{ $d.Truncate (time.ParseDuration "3m") }} → 3h30m0s
{{ $d.Truncate (time.ParseDuration "4s") }} → 3h32m28s
```
