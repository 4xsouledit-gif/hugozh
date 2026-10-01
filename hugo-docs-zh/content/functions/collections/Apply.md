+++
title = "collections.Apply"
linkTitle = "apply"
description = "用指定的函数及参数逐个转换给定切片的元素，返回新切片。"
date = 2026-10-02
weight = 40
source = "https://gohugo.io/functions/collections/apply/"

[params.functions_and_methods]
signatures = ["collections.Apply SLICE FUNCTION PARAM..."]
returnType = "[]any"
aliases = ["apply"]
+++

`apply` 函数接收三个或更多参数，具体数量取决于要应用到切片元素上的函数。

第一个参数是切片本身，第二个参数是函数名，其余参数会传给该函数，其中字符串 `"."` 代表切片元素。

```go-html-template
{{ $s := slice "hello" "world" }}

{{ $s = apply $s "strings.FirstUpper" "." }}
{{ $s }} → [Hello World]

{{ $s = apply $s "strings.Replace" "." "l" "_" }}
{{ $s }} →  [He__o Wor_d]
```
