+++
title = "模板"
linkTitle = "模板"
description = "用模板把内容、资源与数据渲染为发布页面，并概述本章主题与阅读顺序。"
date = 2026-10-01
weight = 70
source = "https://gohugo.io/templates/"
+++

## 本章导读

模板（template）决定内容、资源与数据最终以什么样子发布。Hugo 使用 Go 标准库的 `text/template` 与 `html/template` 包，渲染 HTML 时默认用后者，输出天然对代码注入做了防护；你也可以为 CSV、JSON、RSS、纯文本等输出格式编写模板。

模板由**上下文**（context）、动作、变量、函数与方法组成。其中上下文最关键：传入模板的数据就是上下文，在模板里用点（`.`）表示。页面模板收到的是 `Page` 对象，通过它的方法取得标题、日期与自定义参数。新手最常见的模板错误大多与上下文有关，建议先弄清这个概念。

## 阅读顺序建议

1. [简介](/templates/introduction/)：上下文、动作、变量、函数与方法的基本用法，是后面各页的共同基础。
2. [新版模板系统概览](/templates/new-templatesystem-overview/)：`layouts` 目录在 v0.146.0 之后的组织方式与迁移要点。
3. [模板查找顺序](/templates/lookup-order/)：Hugo 如何在页面种类、布局、输出格式与语言之间取舍。
4. [局部模板装饰器](/templates/partial-decorators/)：用 `partial` 组合可复用的包裹式组件。
5. [短代码模板](/templates/shortcode/)：把模板能力带到内容写作中。

刚开始接触 Hugo 的话，建议先完成[快速开始](/getting-started/quick-start/)，对项目目录结构与构建流程有个整体印象，再回到本章。内容写作中常见的短代码调用语法，参见[短代码](/shortcodes/)。
