+++
title = "函数"
linkTitle = "函数"
description = "在模板与原型中使用的全部函数与方法。"
date = 2026-10-02
weight = 10
source = "https://gohugo.io/functions/"
+++

## 本章导读

模板的能力来自函数（function）与方法（method）。本目录按包（package）分组收录 Hugo 内建的全部函数，例如 `collections`、`strings`、`transform`、`urls`；函数名与参数、返回值都保持英文原样，不译。

调用函数通常有两种写法：直接嵌套 `{{ sub 3 2 }}`，或用管道 `{{ 3 | sub 2 }}`。管道把左侧的结果作为右侧函数的最后一个参数传入，读起来更接近数据流动的顺序。

同名函数与方法的差别，以及命名空间（如 `hugo.`、`site.`、`strings.`）的含义，分别见[方法](/methods/)一章与各页说明。
