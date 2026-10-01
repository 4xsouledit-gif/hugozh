+++
title = "Unix"
linkTitle = "Unix"
description = "返回给定 time.Time 值自 1970 年 1 月 1 日 UTC 起经过的秒数。"
date = 2026-10-02
weight = 210
source = "https://gohugo.io/methods/time/unix/"
aliases = ["/functions/unix"]

[params.functions_and_methods]
signatures = ["TIME.Unix"]
returnType = "int64"
+++

参见 [Unix 时间戳][]。

```go-html-template
{{ $t := time.AsTime "2023-01-27T23:44:58-08:00" }}
{{ $t.Unix }} → 1674891898
```

[Unix 时间戳]: https://en.wikipedia.org/wiki/Unix_time
