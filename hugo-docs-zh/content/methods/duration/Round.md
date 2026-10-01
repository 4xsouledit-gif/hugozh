+++
title = "Round"
linkTitle = "Round"
description = "返回把 DURATION1 舍入到最接近 DURATION2 整数倍后的结果。"
date = 2026-10-02
weight = 70
source = "https://gohugo.io/methods/duration/round/"

[params.functions_and_methods]
signatures = ["DURATION1.Round DURATION2"]
+++

```go-html-template
{{ $d = time.ParseDuration "3.5h2.5m1.5s" }}

{{ $d.Round (time.ParseDuration "2h") }} → 4h0m0s
{{ $d.Round (time.ParseDuration "3m") }} → 3h33m0s
{{ $d.Round (time.ParseDuration "4s") }} → 3h32m32s
```
