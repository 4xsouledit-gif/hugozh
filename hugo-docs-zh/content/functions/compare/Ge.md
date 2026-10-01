+++
title = "compare.Ge"
linkTitle = "compare.Ge"
description = "报告第一个参数是否大于或等于所有后续参数。"
date = 2026-10-02
weight = 50
source = "https://gohugo.io/functions/compare/ge/"

[params.functions_and_methods]
signatures = ["compare.Ge ARG1 ARG2 [ARG...]"]
returnType = "bool"
aliases = ["ge"]
+++

## 用法

`compare.Ge` 函数报告第一个参数是否大于或等于所有后续参数。数字按值比较，与类型无关。你也可以用该函数比较字符串、布尔值、日期以及其他可比较的数据类型。

## 示例

```go-html-template
{{ compare.Ge 1 1 }} → true
{{ compare.Ge 1 2 }} → false
{{ compare.Ge 2 1 }} → true

{{ compare.Ge 1 1 1 }} → true
{{ compare.Ge 1 1 2 }} → false
{{ compare.Ge 1 2 1 }} → false
{{ compare.Ge 1 2 2 }} → false

{{ compare.Ge 2 1 1 }} → true
{{ compare.Ge 2 1 2 }} → true
{{ compare.Ge 2 2 1 }} → true
```

比较不同类型的数字：

```go-html-template
{{ compare.Ge 1 1.0 }} → true
```

比较其他数据类型：

```go-html-template
{{ compare.Ge "ab" "a" }} → true
{{ compare.Ge time.Now (time.AsTime "1964-12-30") }} → true
{{ compare.Ge true false }} → true
```
