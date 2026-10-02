+++
title = "float"
linkTitle = "float"
description = "浮点数（floating point）的另一种写法。"
date = 2026-10-02
weight = 430
source = "https://gohugo.io/quick-reference/glossary/float/"

[params.teach]
difficulty = "参考"
prereq = ["在文档里遇到不认识的 Hugo 术语时查阅"]
outcomes = ["看到 float 时能立刻对应到 floating point，并判断何时需要显式转换成整数"]
next = ["/functions/cast/"]
+++

参见[floating point](g)。

## 为什么重要

`float` 只是 `floating point` 的简写，文档和函数签名里两种写法都会出现，搜不到内容时先换一个词再搜。实际踩坑点在于类型：front matter 里写成 `3.14` 得到的是浮点数，而需要整数的场合（如按序号排序、传给要求整数的函数）会报类型不符或得到意外顺序，这时要用类型转换函数显式转换，而不是靠改写法碰运气。

延伸阅读：[类型转换函数](/functions/cast/)、[前置元数据](/content-management/front-matter/)
