+++
title = "字符串（string）"
linkTitle = "字符串"
description = "由字节组成的序列。"
date = 2026-10-02
weight = 1330
source = "https://gohugo.io/quick-reference/glossary/string/"

[params.teach]
difficulty = "参考"
prereq = ["在文档里遇到不认识的 Hugo 术语时查阅"]
outcomes = ["能判断一处比较或计数该按字符串还是数字处理，并知道混用时的报错与错误计数"]
next = ["/functions/strings/"]
+++

_字符串_（string）是字节序列。例如，`"What is 6 times 7?"`。

## 为什么重要

模板里字符串与数字不会自动互转：`eq .Params.order 1` 在 `order` 是字符串 `"1"` 时，会因类型不符报错，而不是返回 false。中文还要记住「字节序列」这个定义——`len` 数的是字节，一个汉字算 3 个，要按字符计数得用 `countrunes`。

延伸阅读：[字符串函数](/functions/strings/)、[countrunes](/functions/strings/countrunes/)
