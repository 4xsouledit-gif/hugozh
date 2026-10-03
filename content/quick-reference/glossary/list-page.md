+++
title = "列表页（list page）"
linkTitle = "列表页"
description = "在上下文中接收页面集合的页面类型，包括首页、section 页、分类法页与术语页。"
date = 2026-10-02
weight = 690
source = "https://gohugo.io/quick-reference/glossary/list-page/"

[params.teach]
difficulty = "参考"
prereq = ["在文档里遇到不认识的 Hugo 术语时查阅"]
outcomes = ["能判断当前页面是不是列表页，并说清列表逻辑写在单页模板里为什么不生效"]
next = ["/templates/lookup-order/"]
+++

列表页（list page）是任何在[context](g)中接收页面[collection](g)的[page kind](g)。这包括首页、[section pages](g)、[taxonomy pages](g)和[term pages](g)。

## 为什么重要

列表页与普通内容页走两套模板：Hugo 为首页、section、分类法、术语这些列表页查找列表模板，为普通内容页查找单页模板。把渲染 [page collection](g)（页面集合）的逻辑写进单页模板，改动不会生效，而你还以为是筛选条件写错了。判断当前页是不是列表页，用 `.IsNode` 或 `.Kind` 比盯着目录结构猜更可靠。

延伸阅读：[模板查找顺序](/templates/lookup-order/)、[分页](/templates/pagination/)
