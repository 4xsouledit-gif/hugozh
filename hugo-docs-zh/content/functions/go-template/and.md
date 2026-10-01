+++
title = "and"
linkTitle = "and"
description = "返回第一个假值参数；若所有参数都为真值，则返回最后一个参数。"
date = 2026-10-02
weight = 10
source = "https://gohugo.io/functions/go-template/and/"

[params.functions_and_methods]
signatures = ["and VALUE..."]
returnType = "any"
+++

## 关于真值与假值

假值包括 `false`、`0`、任何 `nil` 指针或接口值、任何长度为零的数组、切片、映射或字符串，以及零值 `time.Time`。

其余一切值都是真值。

## 用法

`and` 函数从左到右依次求值，一旦结果可以确定就立即返回。

```go-html-template
{{ and 1 0 "" }} → 0 (int)
{{ and 1 false 0 }} → false (bool)

{{ and 1 2 3 }} → 3 (int)
{{ and "a" "b" "c" }} → c (string)
{{ and "a" 1 true }} → true (bool)

{{ and false (math.Div 1 0) }} → false (bool)
```

更多信息参见 Go 的 [`text/template`](https://pkg.go.dev/text/template) 文档。
