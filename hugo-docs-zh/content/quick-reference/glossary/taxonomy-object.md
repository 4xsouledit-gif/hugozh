+++
title = "分类法对象（taxonomy object）"
linkTitle = "分类法对象"
description = "由术语及其关联的加权页面组成的映射。"
date = 2026-10-02
weight = 1350
source = "https://gohugo.io/quick-reference/glossary/taxonomy-object/"

[params.teach]
difficulty = "参考"
time = "按需查阅"
prereq = [
  "站点已经配置了分类法（`tags`、`categories` 之类），知道术语（term）是什么。",
]
outcomes = [
  "分清分类法对象（术语 → 页面集合的映射）与分类法页（一个页面）；",
  "在模板里按术语取出其下的页面，并理解为什么返回的是加权页面；",
  "判断该用 `.Site.Taxonomies` 还是 `.GetTerms`。",
]
next = ["/content-management/taxonomies/", "/methods/taxonomy/", "/content-management/taxonomies/#分类法权重"]
+++

_分类法对象_（taxonomy object）是一个 [_map_](g)，包含 [_terms_](g) 以及与之关联的 [_weighted pages_](g)。

## 为什么重要

它是「按标签建索引页」这一类需求的底层结构：键是术语（如 `hugo`），值是那篇术语下的页面集合（带权重）。**它和数据文件里的普通 map 不一样**——遍历它拿到的是加权页面对象，可以直接取 `.Page.Title`、`.Count` 等。

两个最常见的用法区分：

- 想**列出某篇内容身上挂了哪些术语** → 用 `.GetTerms`（页面侧）；
- 想**遍历全部分类法、为每个术语生成索引页** → 用 `.Site.Taxonomies`（站点侧）。

弄混的典型现象是「索引页里只列出了当前文章自己的标签」，而不是全站该标签下的所有文章。

延伸阅读：[分类法](/content-management/taxonomies/)、[Taxonomy 方法](/methods/taxonomy/)
