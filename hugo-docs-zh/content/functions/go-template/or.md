+++
title = "or"
linkTitle = "or"
description = "返回第一个真值参数；若所有参数都为假值，则返回最后一个参数。"
date = 2026-10-02
weight = 110
source = "https://gohugo.io/functions/go-template/or/"

[params.functions_and_methods]
signatures = ["or VALUE..."]
returnType = "any"
+++

## 关于真值与假值

假值包括 `false`、`0`、任何 `nil` 指针或接口值、任何长度为零的数组、切片、映射或字符串，以及零值 `time.Time`。

其余一切值都是真值。

## 用法

`or` 函数从左到右依次求值，一旦结果可以确定就立即返回。

```go-html-template
{{ or 0 1 2 }} → 1 (int)
{{ or false "a" 1 }} → a (string)
{{ or 0 true "a" }} → true (bool)

{{ or false "" 0 }} → 0 (int)
{{ or 0 "" false }} → false (bool)

{{ or true (math.Div 1 0) }} → true (bool)
```

更多信息参见 Go 的 [`text/template`](https://pkg.go.dev/text/template) 文档。
