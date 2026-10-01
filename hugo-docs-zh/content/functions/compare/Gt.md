+++
title = "compare.Gt"
linkTitle = "compare.Gt"
description = "报告第一个参数是否大于所有后续参数。"
date = 2026-10-02
weight = 60
source = "https://gohugo.io/functions/compare/gt/"

[params.functions_and_methods]
signatures = ["compare.Gt ARG1 ARG2 [ARG...]"]
returnType = "bool"
aliases = ["gt"]
+++

## 用法

`compare.Gt` 函数报告第一个参数是否大于所有后续参数。数字按值比较，与类型无关。你也可以用该函数比较字符串、布尔值、日期以及其他可比较的数据类型。

## 示例

```go-html-template
{{ compare.Gt 1 1 }} → false
{{ compare.Gt 1 2 }} → false
{{ compare.Gt 2 1 }} → true

{{ compare.Gt 1 1 1 }} → false
{{ compare.Gt 1 1 2 }} → false
{{ compare.Gt 1 2 1 }} → false
{{ compare.Gt 1 2 2 }} → false

{{ compare.Gt 2 1 1 }} → true
{{ compare.Gt 2 1 2 }} → false
{{ compare.Gt 2 2 1 }} → false
```

比较不同类型的数字：

```go-html-template
{{ compare.Gt 1 1.0 }} → false
```

比较其他数据类型：

```go-html-template
{{ compare.Gt "ab" "a" }} → true
{{ compare.Gt time.Now (time.AsTime "1964-12-30") }} → true
{{ compare.Gt true false }} → true
```
