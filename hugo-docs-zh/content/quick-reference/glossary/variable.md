+++
title = "变量（variable）"
linkTitle = "变量"
description = "以 $ 符号开头的用户自定义标识符，在模板动作中初始化或赋值。"
date = 2026-10-02
weight = 1500
source = "https://gohugo.io/quick-reference/glossary/variable/"

[params.teach]
difficulty = "参考"
prereq = ["在文档里遇到不认识的 Hugo 术语时查阅"]
outcomes = [
  "判断模板里的 `undefined variable` 与「块内赋值不生效」属于哪类作用域问题",
]
next = ["/templates/introduction/"]
+++

_变量_（variable）是以 `$` 符号开头的用户自定义 [_identifier_](g)，表示任意数据类型的值，在 [_template action_](g) 中初始化或赋值。例如，`$foo`&nbsp;和&nbsp;`$bar` 都是变量。

## 为什么重要

变量最容易踩的是作用域：`with`、`range`、`if` 块里用 `:=` 声明的变量出了块就没了，模板会直接报 `undefined variable`，或者在外面读到旧值。标准做法是在块外先用 `:=` 声明、块内改用 `=` 赋值，这样循环里累加、拼接的结果才留得住。另外 `$` 指向的是页面的顶层上下文，循环里想访问它就得靠这个符号，别把它误当成普通变量。

延伸阅读：[模板入门](/templates/introduction/)、[检查与调试](/troubleshooting/inspection/)
