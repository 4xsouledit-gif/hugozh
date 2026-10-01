+++
title = "strings.TrimPrefix"
linkTitle = "TrimPrefix"
description = "返回给定字符串，并从开头删除指定前缀。"
date = 2026-10-02
weight = 280
source = "https://gohugo.io/functions/strings/trimprefix/"

[params.functions_and_methods]
signatures = ["strings.TrimPrefix PREFIX STRING"]
returnType = "string"
+++

```go-html-template
{{ strings.TrimPrefix "a" "aabbaa" }} → abbaa
{{ strings.TrimPrefix "aa" "aabbaa" }} → bbaa
{{ strings.TrimPrefix "aaa" "aabbaa" }} → aabbaa
```
