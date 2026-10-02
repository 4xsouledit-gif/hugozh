+++
title = "数组"
linkTitle = "数组"
description = "长度固定的元素序列，区别于长度可变的切片。"
date = 2026-10-02
weight = 50
source = "https://gohugo.io/quick-reference/glossary/array/"

[params.teach]
difficulty = "参考"
prereq = ["在文档里遇到不认识的 Hugo 术语时查阅"]
outcomes = ["分清数组与切片，判断手里的值能不能追加、能不能用集合函数处理"]
next = ["/functions/collections/"]
+++

## 数组

_数组_（array）是带编号的 [element](g)（元素）序列。与 Go 的 [slice](g)（切片）数据类型不同，数组的长度固定。数组中的元素可以是 [scalar](g)（标量）、切片、[map](g)（映射）、页面或其他数组。

参见：[Go 语言规范：数组类型](https://go.dev/ref/spec#Array_types)

## 为什么重要

内容和函数返回值日常几乎都是切片，数组主要出现在类型说明里；把两者混为一谈，就会写出对数组追加元素的代码，构建时直接报类型错误。区分它们最直接的办法是看能不能用 `append` 改变长度：能变的是切片。数组只有固定的几个位置，越界访问会报错而不是补 `nil`。

延伸阅读：[集合函数](/functions/collections/) · [函数速查](/quick-reference/functions/)
