+++
title = "compare.Le"
linkTitle = "compare.Le"
description = "报告第一个参数是否小于或等于所有后续参数。"
date = 2026-10-02
weight = 70
source = "https://gohugo.io/functions/compare/le/"

[params.functions_and_methods]
signatures = ["compare.Le ARG1 ARG2 [ARG...]"]
returnType = "bool"
aliases = ["le"]
+++

## 用法

`compare.Le` 函数报告第一个参数是否小于或等于所有后续参数。数字按值比较，与类型无关。你也可以用该函数比较字符串、布尔值、日期以及其他可比较的数据类型。

## 示例

```go-html-template
{{ compare.Le 1 1 }} → true
{{ compare.Le 1 2 }} → true
{{ compare.Le 2 1 }} → false

{{ compare.Le 1 1 1 }} → true
{{ compare.Le 1 1 2 }} → true
{{ compare.Le 1 2 1 }} → true
{{ compare.Le 1 2 2 }} → true

{{ compare.Le 2 1 1 }} → false
{{ compare.Le 2 1 2 }} → false
{{ compare.Le 2 2 1 }} → false
```

比较不同类型的数字：

```go-html-template
{{ compare.Le 1 1.0 }} → true
```

比较其他数据类型：

```go-html-template
{{ compare.Le "ab" "a" }} → false
{{ compare.Le time.Now (time.AsTime "1964-12-30") }} → false
{{ compare.Le true false }} → false
```
