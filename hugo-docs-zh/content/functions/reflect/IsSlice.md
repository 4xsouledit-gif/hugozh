+++
title = "reflect.IsSlice"
linkTitle = "IsSlice"
description = "报告给定值是否为切片（slice）。"
date = 2026-10-02
weight = 90
source = "https://gohugo.io/functions/reflect/isslice/"

[params.functions_and_methods]
signatures = ["reflect.IsSlice INPUT"]
returnType = "bool"
+++

```go-html-template
{{ reflect.IsSlice (slice 1 2 3) }} → true
{{ reflect.IsSlice "yo" }} → false
```
