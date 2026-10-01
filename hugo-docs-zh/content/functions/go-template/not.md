+++
title = "not"
linkTitle = "not"
description = "对唯一参数取布尔反。"
date = 2026-10-02
weight = 100
source = "https://gohugo.io/functions/go-template/not/"

[params.functions_and_methods]
signatures = ["not VALUE"]
returnType = "bool"
+++

## 用法

与 `and`、`or` 运算符不同，`not` 运算符总是返回布尔值。

```go-html-template
{{ not true }} → false
{{ not false }} → true

{{ not 1 }} → false
{{ not 0 }} → true

{{ not "x" }} → false
{{ not "" }} → true
```

连续两次使用 `not` 运算符，可以把任意值转换为布尔值。例如：

```go-html-template
{{ 42 | not | not }} → true
{{ "" | not | not }} → false
```

更多信息参见 Go 的 [`text/template`](https://pkg.go.dev/text/template) 文档。
