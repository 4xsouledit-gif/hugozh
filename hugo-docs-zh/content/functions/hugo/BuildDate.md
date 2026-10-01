+++
title = "hugo.BuildDate"
linkTitle = "hugo.BuildDate"
description = "返回 Hugo 二进制的编译日期。"
date = 2026-10-02
weight = 20
source = "https://gohugo.io/functions/hugo/builddate/"

[params.functions_and_methods]
signatures = ["hugo.BuildDate"]
returnType = "string"
+++

## 用法

`hugo.BuildDate` 函数返回 Hugo 二进制的编译日期，格式遵循 [RFC 3339][]。

```go-html-template
{{ hugo.BuildDate }} → 2023-11-01T17:57:00Z
```

[RFC 3339]: https://datatracker.ietf.org/doc/html/rfc3339
