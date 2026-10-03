+++
title = "浮点数（floating point）"
linkTitle = "浮点数"
description = "带有小数部分的数值数据类型，例如 `3.14159`。"
date = 2026-10-02
weight = 440
source = "https://gohugo.io/quick-reference/glossary/floating-point/"

[params.teach]
difficulty = "参考"
prereq = ["在文档里遇到不认识的 Hugo 术语时查阅"]
outcomes = ["能判断 front matter 里的数字会被解析成整数还是浮点数，并知道类型不符时报错该怎么修"]
next = ["/functions/math/"]
+++

浮点数（floating point）指带有小数部分的数值数据类型，例如 `3.14159`。

## 为什么重要

数字在 front matter 里的类型由写法决定：`1` 是整数，`1.0`、`3.14` 是浮点数，加引号则变成字符串，而模板函数对类型很敏感。常见症状是把整数和浮点数混在一起比较时（例如 `eq`）可能报 `incompatible types for comparison`，或者对字符串做加法时报 `expected float64`。数学函数大多按浮点数工作，需要整数时要用类型转换函数显式转换，单靠改 front matter 的写法很容易在下一个文件里再犯。

延伸阅读：[数学函数](/functions/math/)、[类型转换函数](/functions/cast/)
