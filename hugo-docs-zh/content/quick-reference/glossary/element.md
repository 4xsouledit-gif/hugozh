+++
title = "元素"
linkTitle = "元素"
description = "切片或数组中的成员。"
date = 2026-10-02
weight = 380
source = "https://gohugo.io/quick-reference/glossary/element/"

[params.teach]
difficulty = "参考"
prereq = ["在文档里遇到不认识的 Hugo 术语时查阅"]
outcomes = ["能分清「集合」与「集合里的元素」，并解释 range 循环里字段取不到值的原因"]
next = ["/functions/collections/"]
+++

## 元素

_元素_（element）是[slice](g)或[array](g)的成员。

## 为什么重要

遍历集合时，每一轮迭代的点号就是当前元素，而不是整个集合：在页面列表里写 `{{ .Title }}` 得到的是这一页的标题，想用整页对象得退回到 `$`。把元素当成集合继续取（例如对单个页面再调 `.Pages`）会报 `can't evaluate field`；元素类型不符合预期时，`where`、`sort` 这类函数会静默返回空结果，列表因此整段消失而不报错。

延伸阅读：[集合函数](/functions/collections/)、[页面集合](/quick-reference/page-collections/)
