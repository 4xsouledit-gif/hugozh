+++
title = "标识符（identifier）"
linkTitle = "标识符"
description = "表示变量、方法、对象或字段的字符串，须符合 Go 的标识符规范。"
date = 2026-10-02
weight = 550
source = "https://gohugo.io/quick-reference/glossary/identifier/"

[params.teach]
difficulty = "参考"
prereq = ["在文档里遇到不认识的 Hugo 术语时查阅"]
outcomes = ["能判断模板里的一个名字是不是标识符，以及它为什么拼错就会取值失败"]
next = ["/templates/introduction/"]
+++

标识符（identifier）是表示 [variable](g)（变量）、[method](g)（方法）、[object](g)（对象）或 [field](g)（字段）的字符串。它必须符合 Go 的[语言规范][language specification]，以字母或下划线开头，后跟零个或多个字母、数字或下划线。

[language specification]: https://go.dev/ref/spec#Identifiers

## 为什么重要

写模板时几乎每一行都在写标识符：`.Site.Params.author`、`.Page.Title` 里的每一段都是。名字拼错、大小写写错，或者数据文件里的键名与模板里写的不一致，Hugo 不会静默忽略，而是报 `can't evaluate field` 一类的错误，或者取到 nil、在页面上留下一片空白。这条规则同样约束前置元数据与数据文件里的键名，所以键名一旦定下就要前后一致。

延伸阅读：[模板简介](/templates/introduction/)、[Params](/methods/page/params/)
