+++
title = "默认排序顺序"
linkTitle = "默认排序顺序"
description = "未指定其他排序条件时，页面集合的排序优先级。"
date = 2026-10-02
weight = 330
source = "https://gohugo.io/quick-reference/glossary/default-sort-order/"

[params.teach]
difficulty = "参考"
prereq = ["在文档里遇到不认识的 Hugo 术语时查阅"]
outcomes = ["能解释列表页在没有显式排序时为什么是这个顺序，并知道该补 weight 还是 date 来调整它"]
next = ["/quick-reference/page-collections/"]
+++

## 默认排序顺序

[page collection](g)在没有设置其他排序条件时使用的_默认排序顺序_（default sort order）遵循以下优先级：

1. [`weight`][]（升序）
1. [`date`][]（降序）
1. [`linkTitle`][]，缺失时回退到 [`title`][]（升序）
1. [logical path](g)（升序）

## 为什么重要

列表页、上一篇/下一篇、`site.RegularPages` 的顺序都由它决定；只要不写显式排序，改 front matter 里的权重或日期就会改变整站导航顺序。新手最常见的困惑是「刚写的文章没排在最前面」——如果同目录页面都写了 `weight`，那么日期再新也排在后面，因为 `weight` 优先级最高；反过来，一批页面都没写 `weight` 时靠 `date` 降序，日期缺失或格式不对的页面会悄悄掉到末尾。

延伸阅读：[页面集合](/quick-reference/page-collections/)、[前置元数据](/content-management/front-matter/)

[`date`]: /content-management/front-matter/#date
[`linkTitle`]: /content-management/front-matter/#linktitle
[`title`]: /content-management/front-matter/#title
[`weight`]: /content-management/front-matter/#weight
