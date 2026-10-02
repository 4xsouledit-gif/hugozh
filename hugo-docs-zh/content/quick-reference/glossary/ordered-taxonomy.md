+++
title = "有序分类法（ordered taxonomy）"
linkTitle = "有序分类法"
description = "对 Taxonomy 对象调用 Alphabetical 或 ByCount 方法后得到的切片。"
date = 2026-10-02
weight = 830
source = "https://gohugo.io/quick-reference/glossary/ordered-taxonomy/"

[params.teach]
difficulty = "参考"
prereq = ["在文档里遇到不认识的 Hugo 术语时查阅"]
outcomes = ["分清 Taxonomy 对象与由它派生出的有序分类法，知道遍历结果里该取 `.Term`、`.WeightedPages` 还是 `.Page`"]
next = ["/methods/taxonomy/"]
+++

有序分类法（ordered taxonomy）由 [`Alphabetical`][] 或 [`ByCount`][] 方法作用于 [`Taxonomy`](g) 对象而创建，该对象是一种 [map](g)。有序分类法是一个 [slice](g)，其中每个元素都是一个对象，包含对应的 [term](g) 及其 [weighted pages](g) 的切片。

## 为什么重要

分类法列表页几乎总要决定「按名称排」还是「按文章数排」，而这两种顺序都只能通过有序分类法拿到；直接遍历 `.Site.Taxonomies.tags` 得到的只是一个未排序的 map。
两者的用法不能互换：有序分类法的每一项自带 `.Page`、`.Term`、`.WeightedPages`，在模板里直接取值即可；按 map 的直觉写成 `range $name, $pages := ...`，取值会落空，页面看起来「有分类法却没有内容」——构建本身不报错，只能靠输出结果判断。

延伸阅读：[分类法方法](/methods/taxonomy/) · [内容管理：分类法](/content-management/taxonomies/)

[`Alphabetical`]: /methods/taxonomy/alphabetical/
[`ByCount`]: /methods/taxonomy/bycount/
