+++
title = "维度"
linkTitle = "维度"
description = "内容变化的分类轴：语言、角色与版本。"
date = 2026-10-02
weight = 360
source = "https://gohugo.io/quick-reference/glossary/dimension/"

[params.teach]
difficulty = "参考"
prereq = ["在文档里遇到不认识的 Hugo 术语时查阅"]
outcomes = ["能算出一个逻辑页面会生成多少份变体，并判断 URL 里某一段属于哪根轴"]
next = ["/configuration/versions/"]
+++

## 维度

_维度_（dimension）是内容变化的分类轴，使同一个逻辑页面可以同时存在多个变体。三个维度分别是[language](g)、[role](g)与[version](g)。例如，一个逻辑页面可以同时存在于 6 种语言、4 个版本与 2 种角色中。

## 为什么重要

维度是乘法的：6 种语言 × 4 个版本 × 2 种角色意味着同一个逻辑页面最多会生成 48 份产物，URL 里也就多出对应的层级。只启用其中一根轴时一切正常，一旦多开一根，构建时间和输出目录会立刻成倍增长；更常见的坑是内容目录结构没跟着维度走，于是某些组合悄悄缺页，或者矩阵表达式（如取反的 glob）把整组内容排除掉，而构建照样成功。

延伸阅读：[版本配置](/configuration/versions/)、[多语言](/content-management/multilingual/)
