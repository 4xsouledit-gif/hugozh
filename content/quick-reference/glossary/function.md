+++
title = "函数（function）"
linkTitle = "函数"
description = "模板动作中接收参数并返回值的可调用项，不与对象关联。"
date = 2026-10-02
weight = 470
source = "https://gohugo.io/quick-reference/glossary/function/"

[params.teach]
difficulty = "参考"
prereq = ["在文档里遇到不认识的 Hugo 术语时查阅"]
outcomes = ["能分清写法是函数还是方法，并在报 function not defined 时知道该去哪类文档里查"]
next = ["/functions/"]
+++

函数（function）用在[template action](g)中，接收一个或多个[argument](g)并返回一个值。与[method](g)不同，函数不与[object](g)关联。

## 为什么重要

函数是全局的，写法形如 `strings.Trim`、`collections.Where`，可以直接调用；方法挂在某个对象上，写成 `.Resources`、`.Params` 这样跟在点号后面。把两者搞混是最典型的报错来源：调用不存在的函数名会报 `function "x" not defined`，把方法当函数写会报 `can't evaluate field`。查文档时也要先分清方向——函数在「函数」一章，方法在「方法」一章，站内搜索时用带命名空间的完整写法最准。

延伸阅读：[函数](/functions/)、[方法](/methods/)

参见：[函数](/functions/)
