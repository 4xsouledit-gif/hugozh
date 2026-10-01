+++
title = "默认排序顺序"
linkTitle = "默认排序顺序"
description = "未指定其他排序条件时，页面集合的排序优先级。"
date = 2026-10-02
weight = 330
source = "https://gohugo.io/quick-reference/glossary/default-sort-order/"
+++

## 默认排序顺序

[_页面集合_](g)在没有设置其他排序条件时使用的_默认排序顺序_（default sort order）遵循以下优先级：

1. [`weight`][]（升序）
1. [`date`][]（降序）
1. [`linkTitle`][]，缺失时回退到 [`title`][]（升序）
1. [逻辑路径](g)（升序）

[`date`]: /content-management/front-matter/#date
[`linkTitle`]: /content-management/front-matter/#linktitle
[`title`]: /content-management/front-matter/#title
[`weight`]: /content-management/front-matter/#weight
