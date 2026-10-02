+++
title = "词法分析器（lexer）"
linkTitle = "词法分析器"
description = "识别输入文本中关键字、标识符、运算符与数字等基本构件的软件组件。"
date = 2026-10-02
weight = 680
source = "https://gohugo.io/quick-reference/glossary/lexer/"

[params.teach]
difficulty = "参考"
prereq = ["在文档里遇到不认识的 Hugo 术语时查阅"]
outcomes = ["能判断代码块为什么没有高亮，并知道去哪里确认语言名是否受支持"]
next = ["/content-management/syntax-highlighting/"]
+++

词法分析器（lexer）是一种软件组件，它在输入文本中识别一门编程语言的关键字、[identifiers](g)、运算符、数字及其它基本构件。

## 为什么重要

它对应语法高亮用的 Chroma 词法分析器：代码块的信息字符串写什么语言，Hugo 就去找对应的 lexer。语言名写错或该语言没有内置支持时，代码块照常输出，只是没有高亮，构建也不会失败，所以容易一直没被发现。要确认某个语言名是否可用，查语法高亮与 chromastyles 两页。

延伸阅读：[语法高亮](/content-management/syntax-highlighting/)、[hugo gen chromastyles](/commands/hugo-gen-chromastyles/)
