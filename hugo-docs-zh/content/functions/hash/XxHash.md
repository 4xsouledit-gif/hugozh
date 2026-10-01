+++
title = "hash.XxHash"
linkTitle = "XxHash"
description = "返回给定字符串的 64 位 xxHash 非加密哈希。"
date = 2026-10-02
weight = 20
source = "https://gohugo.io/functions/hash/xxhash/"

[params.functions_and_methods]
signatures = ["hash.XxHash STRING"]
returnType = "string"
aliases = ["xxhash"]
+++

```go-html-template
{{ hash.XxHash "Hello world" }} → c500b0c912b376d8
```

[xxHash][] 是一种速度极快的非加密哈希算法。Hugo 使用[这份 Go 实现][this Go implementation]。

[this Go implementation]: https://github.com/cespare/xxhash
[xxHash]: https://xxhash.com/
