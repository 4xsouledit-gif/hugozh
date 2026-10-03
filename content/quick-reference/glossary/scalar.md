+++
title = "标量（scalar）"
linkTitle = "标量"
description = "单个值，取值为 string、integer、浮点数或 boolean 之一。"
date = 2026-10-02
weight = 1190
source = "https://gohugo.io/quick-reference/glossary/scalar/"

[params.teach]
difficulty = "参考"
prereq = ["在文档里遇到不认识的 Hugo 术语时查阅"]
outcomes = ["能判断前置元数据里一个值的类型，并知道类型写错后模板行为会怎样静默改变"]
next = ["/content-management/front-matter/"]
+++

标量（scalar）是单个值，取值为 [string](g)、[integer](g)、[floating point](g) 或 [boolean](g) 之一。

## 为什么重要

前置元数据里的 `weight`、`date` 与各种主题开关都是标量，类型写错往往不会报错，而是静默改变行为。例如把布尔开关写成 `"false"`：模板里的 `if` 只判断真假值，非空字符串一律为真，开关就会「关不掉」。拿不准类型时用 `printf "%T"` 打印一下最快。

延伸阅读：[前置元数据](/content-management/front-matter/)、[配置参数](/configuration/params/)
