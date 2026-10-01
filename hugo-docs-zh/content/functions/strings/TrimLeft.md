+++
title = "strings.TrimLeft"
linkTitle = "TrimLeft"
description = "返回给定字符串，并删除 cutset 中指定的开头字符。"
date = 2026-10-02
weight = 270
source = "https://gohugo.io/functions/strings/trimleft/"

[params.functions_and_methods]
signatures = ["strings.TrimLeft CUTSET STRING"]
returnType = "string"
+++

```go-html-template
{{ strings.TrimLeft "a" "abba" }} → bba
```

`strings.TrimLeft` 函数会在可能的情况下把参数转换为字符串：

```go-html-template
{{ strings.TrimLeft 21 12345 }} → 345 (string)
{{ strings.TrimLeft "rt" true }} → ue
```
