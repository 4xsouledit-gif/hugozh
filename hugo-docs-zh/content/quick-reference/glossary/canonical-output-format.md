+++
title = "规范输出格式"
linkTitle = "规范输出格式"
description = "Hugo 认定为当前页面首选的那一种输出格式。"
date = 2026-10-02
weight = 150
source = "https://gohugo.io/quick-reference/glossary/canonical-output-format/"
+++

## 规范输出格式

_规范输出格式_（canonical output format）是当前页面中 [`rel`][] 属性在项目配置里被设为 `canonical` 的那个[_输出格式_](g)（如果存在这样的格式）。如果当前页面只有一种_输出格式_且它是预定义格式，那么无论其 `rel` 属性是否设为 `canonical`，Hugo 都会自动把它视为_规范输出格式_。自定义输出格式不受这条规则约束，必须把 `rel` 显式设为 `canonical`。

默认情况下，`html` 是唯一具有该设置的预定义_输出格式_，其他所有格式的 `rel` 属性都设为 `alternate`。如果当前页面有两种或更多_输出格式_的 `rel` 属性被设为 `canonical`，则_规范输出格式_是下列位置中第一个指定的格式：

- 当前页面的 [`outputs`][outputs_front_matter] 前置元数据字段，或
- 项目配置中针对当前[_页面种类_](g)的 [`outputs`][outputs_project_config] 小节。

[`rel`]: /configuration/output-formats/#rel
[outputs_front_matter]: /configuration/outputs/#outputs-per-page
[outputs_project_config]: /configuration/outputs/#outputs-per-page-kind
