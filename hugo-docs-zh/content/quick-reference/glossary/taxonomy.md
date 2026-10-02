+++
title = "分类法（taxonomy）"
linkTitle = "分类法"
description = "用于对内容分类的一组相关术语，例如 colors 分类法下的 red、green 和 blue。"
date = 2026-10-02
weight = 1370
source = "https://gohugo.io/quick-reference/glossary/taxonomy/"

[params.teach]
difficulty = "参考"
prereq = ["在文档里遇到不认识的 Hugo 术语时查阅"]
outcomes = [
  "判断一个站点的标签页、分类页为什么生成或为什么没有生成，并知道该去哪一页改配置",
]
next = ["/content-management/taxonomies/"]
+++

_分类法_（taxonomy）是一组用于对内容分类的相关 [_terms_](g)。例如，一个 `colors` 分类法可以包含 `red`、`green` 和 `blue` 这几个术语。

参见：[分类法](/content-management/taxonomies/)

## 为什么重要

分类法决定站点里的标签页、分类页从哪里来：只有在项目配置的 `[taxonomies]` 里声明，Hugo 才会为每个取值生成 [term page](g) 和分类法列表页。最常见的事故是「文章写了 `tags`，产物里却没有 `/tags/`」——要么分类法没声明，要么对应页面类型被 `disableKinds` 关掉了（本站就是这样配置的）。改配置时还要注意：`[taxonomies]` 这样的表头之后不能再写裸键，否则键会落进表里而静默失效。

延伸阅读：[分类法配置](/configuration/taxonomies/)、[site.Taxonomies](/methods/site/taxonomies/)
