+++
title = "分类法权重（taxonomic weight）"
linkTitle = "分类法权重"
description = "在前置元数据中定义、对每个分类法唯一的权重，用于决定 Taxonomy 对象内页面集合的排序。"
date = 2026-10-02
weight = 1340
source = "https://gohugo.io/quick-reference/glossary/taxonomic-weight/"

[params.teach]
difficulty = "参考"
prereq = ["在文档里遇到不认识的 Hugo 术语时查阅"]
outcomes = ["能判断该改普通 `weight` 还是 `<分类法名>_weight`，并预判分类法列表顺序会不会变"]
next = ["/content-management/taxonomies/"]
+++

分类法权重（taxonomic weight）在前置元数据中定义，且对每个分类法唯一，是一个用于决定 [`Taxonomy`](g) 对象中所含页面集合排序顺序的 [_weight_](g)。

参见：[分类法权重](/content-management/taxonomies/#分类法权重)

## 为什么重要

分类法权重只影响分类法页里页面集合的排序，并且按分类法分别生效：由前置元数据里名为 `<分类法名>_weight` 的键指派（例如 `tags_weight = 1000`）。想调整某篇文章在标签列表中的位置，却只改了普通 `weight`，会发现标签列表顺序毫无变化——这是最常见的混淆点。

延伸阅读：[分类法](/content-management/taxonomies/)、[Taxonomy.Get 方法](/methods/taxonomy/get/)
