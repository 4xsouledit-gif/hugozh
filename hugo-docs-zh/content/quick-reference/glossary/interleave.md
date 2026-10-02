+++
title = "交错（interleave）"
linkTitle = "交错"
description = "在字符串的开头、结尾以及每两个字符之间插入另一字符串。"
date = 2026-10-02
weight = 590
source = "https://gohugo.io/quick-reference/glossary/interleave/"

[params.teach]
difficulty = "参考"
prereq = ["在文档里遇到不认识的 Hugo 术语时查阅"]
outcomes = ["能判断某个字符串函数是不是在做交错，以及自己拼接时容易漏掉哪两处"]
next = ["/functions/strings/replacepairs/"]
+++

交错（interleave，动词）是指在另一个字符串的开头、结尾以及每两个相邻字符之间插入一个字符串。

## 为什么重要

它的实际出处是 `strings.ReplacePairs`：当要替换的旧字符串为空时，Hugo 会在目标字符串的开头、结尾以及每两个相邻字符之间插入新字符串，也就是这里说的交错。要生成带固定分隔符的字符序列（例如给编号加间隔）时用它，比在模板里循环取子串更不容易错位。自己拼接最容易漏掉首尾两处插入，结果比预期少两个字符，而且很难一眼看出来。

延伸阅读：[strings.ReplacePairs](/functions/strings/replacepairs/)、[字符串函数](/functions/strings/)
