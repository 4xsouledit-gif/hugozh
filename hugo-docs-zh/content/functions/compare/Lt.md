+++
title = "compare.Lt"
linkTitle = "compare.Lt"
description = "报告第一个参数是否小于所有后续参数。"
date = 2026-10-02
weight = 80
source = "https://gohugo.io/functions/compare/lt/"

[params.functions_and_methods]
signatures = ["compare.Lt ARG1 ARG2 [ARG...]"]
returnType = "bool"
aliases = ["lt"]
+++

## 用法

`compare.Lt` 函数报告第一个参数是否小于所有后续参数。数字按值比较，与类型无关。你也可以用该函数比较字符串、布尔值、日期以及其他可比较的数据类型。

## 示例

```go-html-template
{{ compare.Lt 1 1 }} → false
{{ compare.Lt 1 2 }} → true
{{ compare.Lt 2 1 }} → false

{{ compare.Lt 1 1 1 }} → false
{{ compare.Lt 1 1 2 }} → false
{{ compare.Lt 1 2 1 }} → false
{{ compare.Lt 1 2 2 }} → true

{{ compare.Lt 2 1 1 }} → false
{{ compare.Lt 2 1 2 }} → false
{{ compare.Lt 2 2 1 }} → false
```

比较不同类型的数字：

```go-html-template
{{ compare.Lt 1 1.0 }} → false
```

比较其他数据类型：

```go-html-template
{{ compare.Lt "ab" "a" }} → false
{{ compare.Lt time.Now (time.AsTime "1964-12-30") }} → false
{{ compare.Lt true false }} → false
```
