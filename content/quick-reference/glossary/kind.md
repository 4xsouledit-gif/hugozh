+++
title = "kind"
linkTitle = "kind"
description = "page kind 的简称，即页面类型。"
date = 2026-10-02
weight = 630
source = "https://gohugo.io/quick-reference/glossary/kind/"

[params.teach]
difficulty = "参考"
prereq = ["在文档里遇到不认识的 Hugo 术语时查阅"]
outcomes = ["能判断当前页面属于哪种 page kind，并说清模板改动没生效时该从哪查"]
next = ["/methods/page/kind/"]
+++

参见[page kind](g)。

## 为什么重要

模板里常用 `.Kind` 判断当前页是首页、section 还是普通内容页，Hugo 也用它决定去 `layouts` 下找哪一套模板。把 `page` 与 `section` 搞混，最典型的现象是改了模板却没生效——Hugo 仍按查找顺序里更靠前的那套模板渲染，而你以为是缓存问题。拿不准时先输出 `.Kind` 看一眼，比猜目录结构可靠。

延伸阅读：[Kind](/methods/page/kind/)、[模板查找顺序](/templates/lookup-order/)
