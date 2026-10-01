+++
title = "有序分类法（ordered taxonomy）"
linkTitle = "有序分类法"
description = "对 Taxonomy 对象调用 Alphabetical 或 ByCount 方法后得到的切片。"
date = 2026-10-02
weight = 830
source = "https://gohugo.io/quick-reference/glossary/ordered-taxonomy/"
+++

有序分类法（ordered taxonomy）由 [`Alphabetical`][] 或 [`ByCount`][] 方法作用于 [`Taxonomy`](g) 对象而创建，该对象是一种 [map](g)。有序分类法是一个 [slice](g)，其中每个元素都是一个对象，包含对应的 [term](g) 及其 [weighted pages](g) 的切片。

[`Alphabetical`]: /methods/taxonomy/alphabetical/
[`ByCount`]: /methods/taxonomy/bycount/
