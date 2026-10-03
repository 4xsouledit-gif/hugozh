+++
title = "主题（theme）"
linkTitle = "主题"
description = "提供整套组件的模块，定义站点的布局、呈现与行为。"
date = 2026-10-02
weight = 1420
source = "https://gohugo.io/quick-reference/glossary/theme/"

[params.teach]
difficulty = "参考"
prereq = ["在文档里遇到不认识的 Hugo 术语时查阅"]
outcomes = [
  "判断对主题的改动为什么不生效，并知道覆盖模板与样式该放在哪里",
]
next = ["/hugo-modules/theme-components/"]
+++

_主题_（theme）是一种 [_module_](g)，提供一整套 [_components_](g)，定义站点的布局、呈现和行为。每个主题都是模块，但并非每个模块都是主题。

## 为什么重要

主题是可以叠加的模块，这决定了「改了为什么不生效」：项目里的同名文件永远盖过主题，多个主题按配置顺序从左到右、左边的盖过右边的。把主题的 `hugo.toml` 当成站点配置文件也是常见误解——主题配置里只有 `params`、`menu`、`outputformats`、`mediatypes` 会被读取，其余键静默忽略。要覆盖某个模板或样式，正确做法是在项目里放同名文件，而不是直接改主题目录。

延伸阅读：[主题组件](/hugo-modules/theme-components/)、[使用模块](/hugo-modules/use-modules/)
