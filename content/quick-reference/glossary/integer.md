+++
title = "整数（integer）"
linkTitle = "整数"
description = "不带小数部分的数值数据类型，例如 `42`。"
date = 2026-10-02
weight = 580
source = "https://gohugo.io/quick-reference/glossary/integer/"

[params.teach]
difficulty = "参考"
prereq = ["在文档里遇到不认识的 Hugo 术语时查阅"]
outcomes = ["能判断前置元数据与模板里的一个值是整数还是字符串，并解释排序为什么会错乱"]
next = ["/content-management/front-matter/"]
+++

整数（integer）是不带小数部分的数值数据类型，例如 `42`。

## 为什么重要

前置元数据里的 `weight = 20` 是整数，一旦写成 `weight = "20"`（带引号的字符串），Hugo 会按文本比较，`100` 就排到了 `20` 前面——顺序看着「莫名其妙」，原因多半在这里。模板里用 `eq`、`lt` 比较数字时，类型不符不会报错，只会拿到 `false`，表现为筛选或判断悄悄失效。看到 [weight](g) 与分页参数时，先确认它拿到的是整数。

延伸阅读：[前置元数据](/content-management/front-matter/)、[ByWeight](/methods/pages/byweight/)
