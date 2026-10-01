+++
title = "UnixMicro"
linkTitle = "UnixMicro"
description = "返回给定 time.Time 值自 1970 年 1 月 1 日 UTC 起经过的微秒数。"
date = 2026-10-02
weight = 220
source = "https://gohugo.io/methods/time/unixmicro/"

[params.functions_and_methods]
signatures = ["TIME.UnixMicro"]
returnType = "int64"
+++

参见 [Unix 时间戳][]。

```go-html-template
{{ $t := time.AsTime "2023-01-27T23:44:58-08:00" }}
{{ $t.UnixMicro }} → 1674891898000000
```

[Unix 时间戳]: https://en.wikipedia.org/wiki/Unix_time
