+++
title = "规范输出格式"
linkTitle = "规范输出格式"
description = "Hugo 认定为当前页面首选的那一种输出格式。"
date = 2026-10-02
weight = 150
source = "https://gohugo.io/quick-reference/glossary/canonical-output-format/"

[params.teach]
difficulty = "参考"
prereq = ["在文档里遇到不认识的 Hugo 术语时查阅"]
outcomes = ["判断页面的主 URL 由哪份输出决定，并在改了 outputs 后核对 canonical 地址"]
next = ["/configuration/output-formats/"]
+++

## 规范输出格式

_规范输出格式_（canonical output format）是当前页面中 [`rel`][] 属性在项目配置里被设为 `canonical` 的那个 [output format](g)（输出格式）（如果存在这样的格式）。如果当前页面只有一种输出格式且它是预定义格式，那么无论其 `rel` 属性是否设为 `canonical`，Hugo 都会自动把它视为规范输出格式。自定义输出格式不受这条规则约束，必须把 `rel` 显式设为 `canonical`。

默认情况下，`html` 是唯一具有该设置的预定义输出格式，其他所有格式的 `rel` 属性都设为 `alternate`。如果当前页面有两种或更多输出格式的 `rel` 属性被设为 `canonical`，则规范输出格式是下列位置中第一个指定的格式：

- 当前页面的 [`outputs`][outputs_front_matter] 前置元数据字段，或
- 项目配置中针对当前 [page kind](g)（页面种类）的 [`outputs`][outputs_project_config] 小节。

## 为什么重要

规范输出格式决定同一页面的多份输出里哪一份代表它：`.Permalink`、页面头部写出的 canonical 链接，以及 `.RelPermalink` 回退到的那份输出，都以它为准。把自定义格式的 `rel` 误设成 `canonical`，或让页面同时存在多个 `canonical`，站点就会把不是你想推的地址报给搜索引擎，表现为「收录的 URL 总是不对」。改完配置后构建一次，检查页面头部里的 canonical 地址是否就是你期望的主 URL。

延伸阅读：[输出格式配置](/configuration/output-formats/) · [输出配置](/configuration/outputs/)

[`rel`]: /configuration/output-formats/#rel
[outputs_front_matter]: /configuration/outputs/#outputs-per-page
[outputs_project_config]: /configuration/outputs/#outputs-per-page-kind
