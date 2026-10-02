+++
title = "分类法页（taxonomy page）"
linkTitle = "分类法页"
description = "page kind 为 taxonomy 的页面，通常是给定分类法内各术语的列表。"
date = 2026-10-02
weight = 1360
source = "https://gohugo.io/quick-reference/glossary/taxonomy-page/"

[params.teach]
difficulty = "参考"
time = "按需查阅"
prereq = [
  "站点已经配置了分类法，并且你知道页面有 `kind` 之分（home / page / section / taxonomy / term）。",
]
outcomes = [
  "分清 taxonomy 页（列出术语）与 term 页（列出该术语下的文章）；",
  "知道 taxonomy 页由哪个模板渲染，以及为什么改 `list.html` 可能影响不到它；",
  "在需要「分类法总览」或「某个标签的文章列表」时选对页面与模板。",
]
next = ["/templates/types/", "/content-management/taxonomies/", "/methods/page/kind/"]
+++

_分类法页_（taxonomy page）是 [_page kind_](g) 为 `taxonomy` 的页面。通常是给定 [_taxonomy_](g) 内 [_terms_](g) 的列表。

## 为什么重要

页面有 `kind` 之分，而**模板是按 kind 查找的**——这就是「为什么我改了某个模板它不生效」的常见来源。以标签为例：

| 页面 | kind | 默认地址 | 列出什么 |
| --- | --- | --- | --- |
| 分类法页 | `taxonomy` | `/tags/` | 全部标签 |
| 术语页 | `term` | `/tags/hugo/` | 该标签下的文章 |

所以 `/tags/` 走的是 taxonomy 页模板，`/tags/hugo/` 走的是 term 页模板；只想改其中一个时不要改错层。各 kind 与模板的对应关系见[模板类型](/templates/types/)。

延伸阅读：[模板类型](/templates/types/)、[分类法](/content-management/taxonomies/)
