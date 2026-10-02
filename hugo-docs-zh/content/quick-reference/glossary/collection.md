+++
title = "集合"
linkTitle = "集合"
description = "数组、切片或映射的统称。"
date = 2026-10-02
weight = 220
source = "https://gohugo.io/quick-reference/glossary/collection/"

[params.teach]
difficulty = "参考"
prereq = ["在文档里遇到不认识的 Hugo 术语时查阅"]
outcomes = ["判断手里的集合是切片还是映射，从而选对遍历方式与索引方式"]
next = ["/functions/collections/"]
+++

## 集合

_集合_（collection）是 [array](g)（数组）、[slice](g)（切片）或 [map](g)（映射）。

## 为什么重要

集合函数（`where`、`sort`、`first`、`group` 等）对切片和映射都适用，但遍历时拿到的东西不一样：切片得到序号与元素，映射得到键与值。把映射当切片用 `index` 取第 n 项，拿到的往往是键名，构建不报错但内容错了。遍历前先用 `reflect.IsMap` 判断类型，可以少走弯路。

延伸阅读：[集合函数](/functions/collections/) · [函数速查](/quick-reference/functions/)
