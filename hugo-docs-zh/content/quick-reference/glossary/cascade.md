+++
title = "级联"
linkTitle = "级联"
description = "把分支页面或项目配置中的值传递给后代页面。"
date = 2026-10-02
weight = 160
source = "https://gohugo.io/quick-reference/glossary/cascade/"

[params.teach]
difficulty = "参考"
prereq = ["在文档里遇到不认识的 Hugo 术语时查阅"]
outcomes = ["判断级联为什么对个别页面不起作用，并能找到覆盖它的那一处定义"]
next = ["/configuration/cascade/"]
+++

## 级联

_级联_（cascade）一个值，就是把 [branch](g)（分支）页面或项目配置中的 [front matter](g)（前置元数据）值应用到后代页面。如果后代页面已经定义了该字段，或者更近的祖先分支、级联数组中更靠前的元素已经为同一字段设置了值，Hugo 就不会级联该值。可以用 [page matcher](g)（页面匹配器）把级联限制在部分页面上。

参见：[级联配置](/configuration/cascade/)

## 为什么重要

级联省掉了逐页重复写字段：给一个 section 的 `_index.md` 加上 cascade，整章页面就都有同一个参数、`type` 或输出设置。但它的优先级低于页面自己写的值，所以「明明级联了，个别页面却没生效」几乎总是因为那个页面自己定义了同名字段，或被更近的分支覆盖。排查时从出问题的页面往上找最近的一处定义。

延伸阅读：[前置元数据](/content-management/front-matter/) · [内容区块](/content-management/sections/)
