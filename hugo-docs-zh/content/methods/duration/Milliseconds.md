+++
title = "Milliseconds"
linkTitle = "Milliseconds"
description = "以整数形式返回该 time.Duration 值对应的毫秒数。"
date = 2026-10-02
weight = 40
source = "https://gohugo.io/methods/duration/milliseconds/"

[params.functions_and_methods]
signatures = ["DURATION.Milliseconds"]
returnType = "int64"
+++

```go-html-template
{{ $d = time.ParseDuration "3.5h2.5m1.5s" }}
{{ $d.Milliseconds }} → 12751500
```
