+++
title = "strings.Trim"
linkTitle = "Trim"
description = "返回给定字符串，并删除 cutset 中指定的首尾字符。"
date = 2026-10-02
weight = 260
source = "https://gohugo.io/functions/strings/trim/"

[params.functions_and_methods]
signatures = ["strings.Trim STRING CUTSET"]
returnType = "string"
aliases = ["trim"]
+++

```go-html-template
{{ trim "++foo--" "+-" }} → foo
```
