+++
title = "局部模板装饰器（partial decorator）"
linkTitle = "局部模板装饰器"
description = "充当包装组件的特殊局部模板。"
date = 2026-10-02
weight = 960
source = "https://gohugo.io/quick-reference/glossary/partial-decorator/"

[params.teach]
difficulty = "参考"
prereq = ["在文档里遇到不认识的 Hugo 术语时查阅"]
outcomes = ["判断什么时候该用装饰器而不是普通局部模板，并知道被包裹的内容要注入到哪个位置"]
next = ["/templates/partial-decorators/"]
+++

局部模板装饰器（partial decorator）是一种特定类型的 [partial template](g)，充当 [wrapper component](g)。普通的局部模板只是在固定模板中渲染数据，而装饰器使用组合来包裹整块内容。它借助 [`templates.Inner`][] 函数作为占位符，精确指定外部内容应注入到包装布局中的哪个位置。

参见：[局部模板装饰器](/templates/partial-decorators/)

## 为什么重要

页头、卡片、告示框这类「外壳固定、内容多变」的结构用装饰器最省事：调用方只写内容，外壳由装饰器统一维护，样式也就不会在各页之间逐渐跑偏。
关键差别在调用方式——装饰器必须用内嵌（block）形式调用，把内容传进去；当成普通局部模板直接调用时，`templates.Inner` 的位置是空的，渲染出来只剩外壳、看不到正文。

延伸阅读：[局部模板装饰器](/templates/partial-decorators/) · [templates.Inner](/functions/templates/inner/)

[`templates.Inner`]: /functions/templates/inner/
