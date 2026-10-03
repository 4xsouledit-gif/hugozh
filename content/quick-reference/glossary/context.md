+++
title = "上下文"
linkTitle = "上下文"
description = "模板动作中点号所代表的数据结构当前位置。"
date = 2026-10-02
weight = 290
source = "https://gohugo.io/quick-reference/glossary/context/"

[params.teach]
difficulty = "参考"
prereq = ["在文档里遇到不认识的 Hugo 术语时查阅"]
outcomes = ["能判断模板里点号（`.`）此刻指向什么，并据此解释「字段明明存在却取不到值」的现象"]
next = ["/templates/introduction/"]
+++

## 上下文

_上下文_（context）在[template action](g)中用点号（`.`）表示，指的是数据结构中的当前位置。例如，遍历页面[collection](g)时，每次迭代中的上下文就是该页面的数据结构。每个模板接收到的上下文取决于模板类型，以及模板被调用的方式。

## 为什么重要

模板里几乎每个字段都相对于上下文求值，所以同一个 `.Title` 在不同位置可能是页面标题、也可能是别的对象。最常见的现象是：在 `range` 里直接写 `{{ .Title }}`，输出变成空白或报 `can't evaluate field`——因为点号已经变成了当前元素，要取回页面得用 `$.Title`。调用局部模板时若不显式传入上下文（写成 `partial "x.html"` 而漏掉后面的点号），被调模板里的点号就是 nil，取任何字段都会失败。

延伸阅读：[模板简介](/templates/introduction/)、[Page 方法](/methods/page/)

参见：[模板简介](/templates/introduction/#上下文)
