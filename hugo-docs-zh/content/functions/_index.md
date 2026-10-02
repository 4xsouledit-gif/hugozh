+++
title = "函数"
linkTitle = "函数"
description = "在模板与原型中使用的全部函数与方法。"
date = 2026-10-02
weight = 10
source = "https://gohugo.io/functions/"

[params.teach]
difficulty = "参考"
time = "按需查阅；通读约 30 分钟"
prereq = [
  "知道 Go 模板的基本语法（`{{ }}`、变量、`if` / `range` / `with`），否则先读[模板简介](/templates/introduction/)。",
  "手边有一个能构建的站点，遇到函数时可以立刻放进模板里试一次。",
]
outcomes = [
  "按包（`strings`、`collections`、`transform`、`urls` 等）找到需要的函数，而不是靠翻页；",
  "分清**函数**与[方法](/methods/)：什么时候写 `strings.Truncate`，什么时候写 `$page.Title`；",
  "看懂管道写法 `{{ $x | f a }}` 与嵌套写法 `{{ f a $x }}` 为什么等价；",
  "判断一个函数拿到空值、`nil` 或不符类型时会返回什么，而不是假设它一定会报错。",
]
next = ["/methods/", "/templates/introduction/", "/quick-reference/"]
+++

## 本章导读

模板的能力来自函数（function）与方法（method）。本目录按包（package）分组收录 Hugo 内建的全部函数，例如 `collections`、`strings`、`transform`、`urls`；函数名与参数、返回值都保持英文原样，不译。

调用函数通常有两种写法：直接嵌套 `{{ sub 3 2 }}`，或用管道 `{{ 3 | sub 2 }}`。管道把左侧的结果作为右侧函数的最后一个参数传入，读起来更接近数据流动的顺序。

同名函数与方法的差别，以及命名空间（如 `hugo.`、`site.`、`strings.`）的含义，分别见[方法](/methods/)一章与各页说明。
