+++
title = "组件"
linkTitle = "组件"
description = "统一文件系统中承担某项构建功能的一组相关文件，共七类。"
date = 2026-10-02
weight = 230
source = "https://gohugo.io/quick-reference/glossary/component/"

[params.teach]
difficulty = "参考"
prereq = ["在文档里遇到不认识的 Hugo 术语时查阅"]
outcomes = ["看着一个文件说出它属于哪类组件、会被怎么处理，从而判断模板或资源为什么没生效"]
next = ["/getting-started/directory-structure/"]
+++

## 组件

_组件_（component）是一组相关文件，位于 [unified file system](g)（统一文件系统）中，用于在构建 Hugo [project](g)（项目）时完成某项特定功能。这些组件分为七类：[archetype](g)（原型）、资源、内容、数据、模板、[translation table](g)（翻译表）与静态文件，既可以定义在项目中，也可以由 [module](g)（模块）提供。每类组件在统一文件系统中都有专用目录：

组件|统一文件系统中的目录
:--|:--
archetypes|`archetypes`
assets|`assets`
content|`content`
data|`data`
templates|`layouts`
translation tables|`i18n`
static files|`static`

## 为什么重要

文件放在哪个组件目录里，决定它被怎么处理：`assets/` 走资源管道，`static/` 原样拷贝，`layouts/` 是模板，`i18n/` 是翻译表，`data/` 供模板读取。同一份 CSS 放在 `assets/` 还是 `static/`，直接决定它能否被编译和加指纹。主题与模块也按同样的目录规则参与合并，所以「模板没生效、文件找不到」经常是放错了目录，而不是写法有问题。

延伸阅读：[目录结构](/getting-started/directory-structure/) · [主题组件](/hugo-modules/theme-components/)
