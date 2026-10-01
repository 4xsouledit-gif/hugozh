+++
title = "strings.TrimRight"
linkTitle = "TrimRight"
description = "返回给定字符串，并删除 cutset 中指定的结尾字符。"
date = 2026-10-02
weight = 290
source = "https://gohugo.io/functions/strings/trimright/"

[params.functions_and_methods]
signatures = ["strings.TrimRight CUTSET STRING"]
returnType = "string"
+++

```go-html-template
{{ strings.TrimRight "a" "abba" }} → abb
```

`strings.TrimRight` 函数会在可能的情况下把参数转换为字符串：

```go-html-template
{{ strings.TrimRight 54 12345 }} → 123 (string)
{{ strings.TrimRight "eu" true }} → tr
```
