+++
title = "管道符（pipe）"
linkTitle = "管道符"
description = "pipeline 的简称。"
date = 2026-10-02
weight = 1000
source = "https://gohugo.io/quick-reference/glossary/pipe/"

[params.teach]
difficulty = "参考"
prereq = ["在文档里遇到不认识的 Hugo 术语时查阅"]
outcomes = ["读懂 `|` 两侧的传参关系，并在参数顺序不对时知道问题出在哪"]
next = ["/templates/introduction/"]
+++

参见 [pipeline](g)。

## 为什么重要

管道符 `|` 把左边的值作为**最后一个**参数传给右边的函数或方法，所以 `A | f B` 等价于 `f B A`；记住这一点能避开绝大多数「参数顺序不对」的报错。
它也关乎可读性：一串处理按数据流动的方向从左到右写，比嵌套调用更容易核对参数位置，而写错时得到的往往不是报错，只是错误结果。

延伸阅读：[模板简介](/templates/introduction/) · [函数一览](/functions/)
