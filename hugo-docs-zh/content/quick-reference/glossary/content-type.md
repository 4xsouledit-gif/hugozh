+++
title = "内容类型"
linkTitle = "内容类型"
description = "由顶层目录名或 type 决定的内容分类，影响模板查找与原型选用。"
date = 2026-10-02
weight = 270
source = "https://gohugo.io/quick-reference/glossary/content-type/"

[params.teach]
difficulty = "参考"
prereq = ["在文档里遇到不认识的 Hugo 术语时查阅"]
outcomes = ["判断一个页面命中了哪套模板与哪个原型，以及改目录名或 type 会连带影响什么"]
next = ["/templates/lookup-order/"]
+++

## 内容类型

_内容类型_（content type）是由顶层目录名推断出的内容分类，也可以在前置元数据（[front matter](g)）中用 `type` 指定。`content` 目录根部的页面（包括首页）的内容类型是 "page"。内容类型是模板查找顺序的影响因素之一，也决定创建新内容时使用哪个 [archetype](g)（原型）模板。

## 为什么重要

内容类型是模板查找的输入：`layouts/<type>/` 下的模板只作用于对应类型，`hugo new content` 也按它挑原型。改顶层目录名，或在页面里加一个 `type` 字段，就可能整套布局与原型都换掉——「只是改了个目录名，页面样式全变了」通常就是它。想在模板里判断当前类型，用 `.Type`，不要去比对目录字符串。

延伸阅读：[布局查找顺序](/templates/lookup-order/) · [目录结构](/getting-started/directory-structure/)
