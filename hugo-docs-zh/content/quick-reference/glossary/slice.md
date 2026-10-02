+++
title = "切片（slice）"
linkTitle = "切片"
description = "有编号的元素序列，与数组不同，其长度是动态的。"
date = 2026-10-02
weight = 1320
source = "https://gohugo.io/quick-reference/glossary/slice/"

[params.teach]
difficulty = "参考"
prereq = ["在文档里遇到不认识的 Hugo 术语时查阅"]
outcomes = ["能判断模板里一个集合是不是切片，并在取下标或追加元素时避开越界与类型问题"]
next = ["/functions/collections/"]
+++

_切片_（slice）是有编号的元素序列。与 Go 的 [_array_](g) 数据类型不同，切片是动态调整长度的。切片中的 [_elements_](g) 可以是 [_scalars_](g)、[_arrays_](g)、[_maps_](g)、页面或其他切片。

参见：[Go 语言规范：切片类型](https://go.dev/ref/spec#Slice_types)

## 为什么重要

切片是 Hugo 模板里最常见的集合类型：`.Pages`、`.Site.RegularPages` 以及 `where`、`sort` 的返回值都是切片，索引从 0 开始。空切片要用 `len` 或 `with` 判断，直接取下标会报越界；切片长度可变（`append`）而数组长度固定，这也是两者最实际的区别。

延伸阅读：[collections 函数](/functions/collections/)、[where](/functions/collections/where/)
