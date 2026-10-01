+++
title = "strings.TrimSuffix"
linkTitle = "TrimSuffix"
description = "返回给定字符串，并从结尾删除指定后缀。"
date = 2026-10-02
weight = 310
source = "https://gohugo.io/functions/strings/trimsuffix/"

[params.functions_and_methods]
signatures = ["strings.TrimSuffix SUFFIX STRING"]
returnType = "string"
+++

```go-html-template
{{ strings.TrimSuffix "a" "aabbaa" }} → aabba
{{ strings.TrimSuffix "aa" "aabbaa" }} → aabb
{{ strings.TrimSuffix "aaa" "aabbaa" }} → aabbaa
```
