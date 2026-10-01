+++
title = "compare.Ne"
linkTitle = "compare.Ne"
description = "报告第一个参数是否不等于后续参数中的任意一个。"
date = 2026-10-02
weight = 90
source = "https://gohugo.io/functions/compare/ne/"

[params.functions_and_methods]
signatures = ["compare.Ne ARG1 ARG2 [ARG...]"]
returnType = "bool"
aliases = ["ne"]
+++

## 用法

`compare.Ne` 函数报告第一个参数是否不等于后续参数中的任意一个。数字按值比较，与类型无关。你也可以用该函数比较字符串、布尔值、日期以及其他可比较的数据类型。

## 示例

```go-html-template
{{ compare.Ne 1 1 }} → false
{{ compare.Ne 1 2 }} → true

{{ compare.Ne 1 1 1 }} → false
{{ compare.Ne 1 1 2 }} → false
{{ compare.Ne 1 2 1 }} → false
{{ compare.Ne 1 2 2 }} → true
```

比较不同类型的数字：

```go-html-template
{{ compare.Ne 1 1.0 }} → false
```

比较其他数据类型：

```go-html-template
{{ compare.Ne "ab" "a" }} → true
{{ compare.Ne time.Now (time.AsTime "1964-12-30") }} → true
{{ compare.Ne true false }} → true
```
