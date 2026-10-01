+++
title = "compare.Eq"
linkTitle = "compare.Eq"
description = "报告第一个参数是否等于后续参数中的任意一个。"
date = 2026-10-02
weight = 40
source = "https://gohugo.io/functions/compare/eq/"

[params.functions_and_methods]
signatures = ["compare.Eq ARG1 ARG2 [ARG...]"]
returnType = "bool"
aliases = ["eq"]
+++

## 用法

`compare.Eq` 函数报告第一个参数是否等于后续参数中的任意一个。数字按值比较，与类型无关。你也可以用该函数比较字符串、布尔值、日期以及其他可比较的数据类型。

## 示例

```go-html-template
{{ compare.Eq 1 1 }} → true
{{ compare.Eq 1 2 }} → false

{{ compare.Eq 1 1 1 }} → true
{{ compare.Eq 1 1 2 }} → true
{{ compare.Eq 1 2 1 }} → true
{{ compare.Eq 1 2 2 }} → false
```

比较不同类型的数字：

```go-html-template
{{ compare.Eq 1 1.0 }} → true
```

比较其他数据类型：

```go-html-template
{{ compare.Eq "ab" "a" }} → false
{{ compare.Eq time.Now (time.AsTime "1964-12-30") }} → false
{{ compare.Eq true false }} → false
```
