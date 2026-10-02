+++
title = "术语页（term page）"
linkTitle = "术语页"
description = "page kind 为 term 的页面，通常是具有给定术语的常规页与 section 页的列表。"
date = 2026-10-02
weight = 1400
source = "https://gohugo.io/quick-reference/glossary/term-page/"

[params.teach]
difficulty = "参考"
prereq = ["在文档里遇到不认识的 Hugo 术语时查阅"]
outcomes = [
  "分清术语页、分类法页与 section 页的来源，知道它们的 URL 由什么配置决定",
]
next = ["/content-management/taxonomies/"]
+++

_术语页_（term page）是 [_page kind_](g) 为 `term` 的页面。通常是具有给定 [_term_](g) 的 [_regular pages_](g) 和 [_section pages_](g) 的列表。

## 为什么重要

术语页是 Hugo 自动派生的页面：给内容打上标签后，`/tags/foo/` 这类地址就是术语页，不需要你手写。也正因为它由配置自动生成，改分类法声明、`disableKinds` 或 permalinks 就会直接影响它的有无与地址；若把它当普通页面去建同路径文件，会和 Hugo 自己的路由撞车。判断某个列表页到底是术语页还是 section 页，看它的 [page kind](g) 最快。

延伸阅读：[分类法](/content-management/taxonomies/)、[Page.Kind](/methods/page/kind/)
