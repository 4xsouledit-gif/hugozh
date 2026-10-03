+++
title = "嵌入式模板"
linkTitle = "嵌入式模板"
description = "Hugo 内置的模板组件，例如局部模板、短代码与渲染钩子。"
date = 2026-10-02
weight = 390
source = "https://gohugo.io/quick-reference/glossary/embedded-template/"

[params.teach]
difficulty = "参考"
prereq = ["在文档里遇到不认识的 Hugo 术语时查阅"]
outcomes = ["能判断某个功能是 Hugo 自带还是项目里的文件，并知道覆盖它要新建在哪里"]
next = ["/templates/embedded/"]
+++

## 嵌入式模板

_嵌入式模板_（embedded template）是 Hugo 应用程序内置的组件，其中包括[partial](g)、[shortcode](g)与[render hook](g)等特性，它们为创建网站内容提供预定义的结构或功能。

## 为什么重要

内建模板让你不写任何文件就能用上功能，例如内建的 `ref`、`relref` 短代码和默认的标题、图片渲染钩子。要改它们的行为，做法是在项目里新建**同名**文件覆盖，而不是修改 Hugo 安装目录；另外内建模板会随 Hugo 版本更新，把它的内容抄进项目里冻结下来，升级后就拿不到修复和新特性，症状是「官方文档里说支持，但我的站点行为还是旧的」。

延伸阅读：[内建模板](/templates/embedded/)、[渲染钩子简介](/render-hooks/introduction/)
