+++
title = "区间（interval）"
linkTitle = "区间"
description = "两个端点之间的数值范围：闭区间、开区间或半开区间。"
date = 2026-10-02
weight = 620
source = "https://gohugo.io/quick-reference/glossary/interval/"

[params.teach]
difficulty = "参考"
prereq = ["在文档里遇到不认识的 Hugo 术语时查阅"]
outcomes = ["能判断某个取子串、取前 N 项的函数是否包含端点，并解释结果为什么会多一个或少一个"]
next = ["/functions/collections/first/"]
+++

[区间](https://en.wikipedia.org/wiki/Interval_(mathematics))（interval）是两个端点之间的数值范围：闭区间、开区间或半开区间。

- **闭区间**（closed interval）用方括号表示，包含两个端点。例如 [0,&nbsp;1]&nbsp;是满足 `0 <= x <= 1` 的区间。

- **开区间**（open interval）用圆括号表示，不包含端点。例如 (0,&nbsp;1)&nbsp;是满足 `0 < x < 1` 的区间。

- **半开区间**（half-open interval）只包含其中一个端点。例如 (0,&nbsp;1]&nbsp;是满足 `0 < x <= 1` 的**左开**区间，而 [0,&nbsp;1)&nbsp;是满足 `0 <= x < 1` 的**右开**区间。

## 为什么重要

Hugo 里谈区间，多半是在数下标：取子串、取前 N 项这类参数的端点通常左闭右开，`first 3` 拿到的是前三个元素，而不是「第 1 到第 3 个」。把开闭搞反，现象就是结果固定少一个或多一个——少渲染一篇摘要、多截一个字符，而且不会有任何报错。写筛选或分页逻辑前，先确认端点是包含还是排除。

延伸阅读：[collections.First](/functions/collections/first/)、[Limit](/methods/pages/limit/)
