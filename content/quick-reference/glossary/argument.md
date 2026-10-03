+++
title = "参数"
linkTitle = "参数"
description = "传给函数、方法或短代码的值。"
date = 2026-10-02
weight = 40
source = "https://gohugo.io/quick-reference/glossary/argument/"

[params.teach]
difficulty = "参考"
prereq = ["在文档里遇到不认识的 Hugo 术语时查阅"]
outcomes = ["按签名数清一次调用要传几个参数、什么类型，并看懂参数不匹配时的报错"]
next = ["/templates/introduction/"]
+++

## 参数

_参数_（argument）是传给 [function](g)（函数）、[method](g)（方法）或 [shortcode](g)（短代码）的 [scalar](g)（标量）、[array](g)（数组）、[slice](g)（切片）、[map](g)（映射）或 [object](g)（对象）。

## 为什么重要

调用函数或方法时，参数的数量、顺序和类型必须与签名一致：少传一个参数、把字符串当数字传，构建就会报 `wrong number of args` 或类型不匹配。用管道时，上一环的返回值会自动补到下一环的最后一个参数位置，这是最容易数错的地方。拿不准签名时先查函数参考页，比反复试错快。

延伸阅读：[函数](/functions/) · [模板介绍](/templates/introduction/)
