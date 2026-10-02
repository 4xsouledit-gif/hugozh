+++
title = "section 页（section page）"
linkTitle = "section 页"
description = "page kind 为 section 的页面，通常是当前 section 内页面与下级 section 页的列表。"
date = 2026-10-02
weight = 1210
source = "https://gohugo.io/quick-reference/glossary/section-page/"

[params.teach]
difficulty = "参考"
prereq = ["在文档里遇到不认识的 Hugo 术语时查阅"]
outcomes = ["能判断一个页面是不是 section 页，并知道文章从列表消失时该先检查什么"]
next = ["/content-management/sections/"]
+++

_section 页_（section page）是 [_page kind_](g) 为 `section` 的页面。通常是当前 [_section_](g) 内 [_regular pages_](g) 和/或其他 section 页的列表。

## 为什么重要

列表页模板、`.Pages`/`.RegularPages` 与 `.Paginator` 都作用在 section 页上，而不是常规页面，默认模板是 `layouts/_default/section.html` 或 `list.html`。判断依据是目录里的 `_index.md`：把文章文件误命名为 `_index.md`，它就变成 section 页，从 `.RegularPages` 列表里消失——这是「文章不见了」最常见的原因。

延伸阅读：[内容区块](/content-management/sections/)、[模板查找顺序](/templates/lookup-order/)
