+++
title = "映射（map）"
linkTitle = "映射"
description = "由唯一键索引的无序元素集合。"
date = 2026-10-02
weight = 730
source = "https://gohugo.io/quick-reference/glossary/map/"

[params.teach]
difficulty = "参考"
prereq = ["在文档里遇到不认识的 Hugo 术语时查阅"]
outcomes = ["能判断一个值是不是 map，并解释键取不到和顺序不稳定各是什么现象"]
next = ["/functions/collections/dictionary/"]
+++

映射（map）是由唯一键索引的无序元素集合。

参见：[Go 语言规范：映射类型](https://go.dev/ref/spec#Map_types)

## 为什么重要

[front matter](g) 里的参数、`data` 目录下的数据文件、`dict` 的返回值都是 map，模板里用 `.Params.foo` 或 `index` 取值。map 是无序的，直接 `range` 出来的顺序不保证稳定——菜单或参数列表看起来「随机排序」，通常就是这里没显式排序。键不存在时取到的是 nil 而不是报错，页面上出现空白要往这个方向查。

延伸阅读：[collections.Dictionary](/functions/collections/dictionary/)、[数据源](/content-management/data-sources/)
