+++
title = "局部模板（partial template）"
linkTitle = "局部模板"
description = "可从其他模板、短代码、渲染钩子或局部模板调用的模板。"
date = 2026-10-02
weight = 970
source = "https://gohugo.io/quick-reference/glossary/partial-template/"

[params.teach]
difficulty = "参考"
prereq = ["在文档里遇到不认识的 Hugo 术语时查阅"]
outcomes = ["知道局部模板放在哪、怎么被调用，并在片段渲染异常时先判断是不是上下文没传对"]
next = ["/functions/partials/include/"]
+++

局部模板（partial template）是可以从任何其他模板调用的 [template](g)，包括 [shortcodes](g)（短代码）、[render hooks](g)（渲染钩子）和其他局部模板。局部模板要么渲染某些内容，要么返回某些内容。局部模板也可以调用自身，例如用于 [walk](g) 一个数据结构。

## 为什么重要

页面结构里重复出现的片段（页头、卡片、分页条）抽成局部模板后只需维护一处，这是 Hugo 模板复用最基本的做法。
忘记传上下文是最常见的坑：调用时的第二个参数决定片段里的 `.` 是谁，漏掉它往往得到空白输出而不是报错。
局部模板还能用 `return` 返回数字、切片、映射，于是「先算一个值再拿去用」也能封装起来，这是把复杂模板拆小、让主模板保持可读的主要手段。

延伸阅读：[partials.Include](/functions/partials/include/) · [模板查找顺序](/templates/lookup-order/)
