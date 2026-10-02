+++
title = "术语（term）"
linkTitle = "术语"
description = "分类法的成员，用于对内容分类。"
date = 2026-10-02
weight = 1410
source = "https://gohugo.io/quick-reference/glossary/term/"

[params.teach]
difficulty = "参考"
prereq = ["在文档里遇到不认识的 Hugo 术语时查阅"]
outcomes = [
  "判断标签值为什么会聚合成两个页面，或者为什么一个页面都没生成",
]
next = ["/content-management/taxonomies/"]
+++

_术语_（term）是 [_taxonomy_](g) 的成员，用于对内容分类。

参见：[分类法](/content-management/taxonomies/)

## 为什么重要

术语就是你在前置元数据里写的标签值（如 `tags = ["red"]`）。同一个概念写成两种写法（`Red` 与 `red`）会被当成两个术语，聚合出两个页面，读者点进去只看得到一半内容；把标签写在未声明的分类法键下则完全不会生效。术语还有自己的页面地址，改动 URL 或分类法配置后，指向术语页的旧链接会失效，迁移时要一起核对。

延伸阅读：[分类法](/content-management/taxonomies/)、[site.Taxonomies](/methods/site/taxonomies/)
