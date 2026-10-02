+++
title = "原型"
linkTitle = "原型"
description = "创建新内容时套用的模板。"
date = 2026-10-02
weight = 30
source = "https://gohugo.io/quick-reference/glossary/archetype/"

[params.teach]
difficulty = "参考"
prereq = ["在文档里遇到不认识的 Hugo 术语时查阅"]
outcomes = ["判断 hugo new content 生成的新页面为什么长这样，以及该去改哪个文件"]
next = ["/content-management/archetypes/"]
+++

## 原型

_原型_（archetype）是创建新内容时使用的模板。

参见：[原型](/content-management/archetypes/)

## 为什么重要

运行 `hugo new content` 时，Hugo 按内容类型挑一个原型文件，用它渲染出新页面的前置元数据骨架；原型里写死的草稿标记、标题格式与日期都来自它。原型目录位置、文件名与 `type` 对应不上时，新页面会退回到默认原型，表现为字段缺失或与预期不符。原型只影响新建页面，改它不会更新已经存在的内容。

延伸阅读：[快速上手](/getting-started/quick-start/) · [前置元数据](/content-management/front-matter/)
