+++
title = "链式"
linkTitle = "链式"
description = "用点号把标识符连接起来。"
date = 2026-10-02
weight = 170
source = "https://gohugo.io/quick-reference/glossary/chain/"

[params.teach]
difficulty = "参考"
prereq = ["在文档里遇到不认识的 Hugo 术语时查阅"]
outcomes = ["沿着点号逐层核对取值路径，并看懂 can't evaluate field 指向的是哪一环"]
next = ["/templates/introduction/"]
+++

## 链式

_链式_（chain，动词）是用点号连接一个或多个 [identifier](g)（标识符）。标识符可以表示 [method](g)（方法）、[object](g)（对象）或 [field](g)（字段）。例如 `.Site.Params.author.name` 或 `.Date.UTC.Hour`。

## 为什么重要

链式是模板里取值的唯一写法，点号左边必须是对象或集合，右边必须是它真实存在的字段或方法；中间任何一环不存在，构建就会报 `can't evaluate field`。最常见的来源是配置里少写了一层（例如 `params` 下没有那个键）却按有来取值。想确认每一环到底是什么类型，用 `debug.Dump` 打印上一环的值最快。

延伸阅读：[模板介绍](/templates/introduction/) · [site 函数](/functions/global/site/)
