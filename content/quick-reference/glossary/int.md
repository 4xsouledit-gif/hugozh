+++
title = "int"
linkTitle = "int"
description = "integer 的缩写，即整数。"
date = 2026-10-02
weight = 570
source = "https://gohugo.io/quick-reference/glossary/int/"

[params.teach]
difficulty = "参考"
prereq = ["在文档里遇到不认识的 Hugo 术语时查阅"]
outcomes = ["能判断函数签名里的 `int` 要求什么数据，以及类型不符为什么会悄悄改变结果"]
next = ["/functions/cast/"]
+++

参见[integer](g)。

## 为什么重要

你在函数签名、方法说明与速查表里看到的 `int` 就是 integer，指不带小数部分的整数值。把带小数的值交给需要整数的参数（例如页码、长度、[weight](g)）时，Hugo 可能隐式转换、也可能报类型错误，排序或分页结果会因此对不上。看到 `int` 就按整数准备数据；确实要做小数运算，先用类型转换函数把意图写清楚。

延伸阅读：[类型转换函数](/functions/cast/)
