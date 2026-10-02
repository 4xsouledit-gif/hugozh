+++
title = "加权页面（weighted page）"
linkTitle = "加权页面"
description = "分类法对象中的映射，含一个 Page 对象及其在前置元数据中定义的分类法权重。"
date = 2026-10-02
weight = 1560
source = "https://gohugo.io/quick-reference/glossary/weighted-page/"

[params.teach]
difficulty = "参考"
prereq = ["在文档里遇到不认识的 Hugo 术语时查阅"]
outcomes = [
  "判断遍历分类法页面时拿到的是页面还是映射，以及模板为什么报字段不存在",
]
next = ["/content-management/taxonomies/"]
+++

_加权页面_（weighted page）包含在 [_taxonomy object_](g) 中，是一个有两个 [_elements_](g) 的 [_map_](g)：一个 `Page` 对象，以及它在前置元数据中定义的 [_taxonomic weight_](g)。使用 `Page` 和 `Weight` 键访问这两个元素。

## 为什么重要

在分类法或术语页上遍历 `.Pages` 时，拿到的可能不是 `Page` 对象，而是加权页面这样的映射，必须用 `Page` 和 `Weight` 两个键取值。直接把它当页面用，现象是 `.Title` 之类取到空、模板报字段不存在，或者想按分类法权重排序时发现没数据可用。判断手里这个值到底是页面还是映射，最快的办法是把它打印出来看结构。

延伸阅读：[分类法](/content-management/taxonomies/)、[Page.GetTerms](/methods/page/getterms/)
