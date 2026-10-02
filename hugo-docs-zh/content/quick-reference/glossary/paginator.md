+++
title = "分页器（paginator）"
linkTitle = "分页器"
description = "分页页的集合。"
date = 2026-10-02
weight = 940
source = "https://gohugo.io/quick-reference/glossary/paginator/"

[params.teach]
difficulty = "参考"
prereq = ["在文档里遇到不认识的 Hugo 术语时查阅"]
outcomes = ["知道 `.Paginator` 与 `.Paginate` 的取舍，以及分页结果里哪些值可以拿来画导航"]
next = ["/methods/page/paginator/"]
+++

分页器（paginator）是 [pagers](g) 的集合。

## 为什么重要

`.Paginator` 是分页的最短写法：它把当前列表页上下文里的页面集合切成若干 [pager](g)，不接受参数，也不能先筛选或排序；需要先过滤、排序时就该换成 `.Paginate`。
它同时提供 `.PageNumber`、`.TotalPages`、`.HasNext` 等值，页码导航直接依赖这些值——导航不显示，或者最后一页多出一个空页，通常都能在这里找到原因。

延伸阅读：[Paginator 方法](/methods/page/paginator/) · [分页器方法](/methods/pager/)
