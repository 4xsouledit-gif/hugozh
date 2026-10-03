+++
title = "片段（segment）"
linkTitle = "片段"
description = "按逻辑路径、站点矩阵、page kind 或输出格式过滤出的站点子集。"
date = 2026-10-02
weight = 1240
source = "https://gohugo.io/quick-reference/glossary/segment/"

[params.teach]
difficulty = "参考"
prereq = ["在文档里遇到不认识的 Hugo 术语时查阅"]
outcomes = ["能判断项目是否值得用分段渲染，并知道过滤器不匹配时的症状与排查顺序"]
next = ["/configuration/segments/"]
+++

_片段_（segment）是按 [_logical path_](g)、[_sites matrix_](g)、[_page kind_](g) 或 [_output format_](g) 过滤出的站点子集。

参见：[片段配置](/configuration/segments/)

## 为什么重要

片段把「这次构建只渲染哪部分内容」变成配置：定义 `[segments]` 之后用 `--renderSegments` 指定本次要渲染的子集，大型站点可以借此把「每小时重建首页」与「每周重建整站」拆开。过滤器不匹配任何页面时 Hugo 不会报错，只会渲染出一个几乎空的站点，所以先用最宽的条件验证片段能产出内容，再逐步收紧。

延伸阅读：[片段配置](/configuration/segments/)
