+++
title = "包装组件（wrapper component）"
linkTitle = "包装组件"
description = "通过组合而非固定参数包裹其他内容的接口模式，为调用方提供可复用的外壳。"
date = 2026-10-02
weight = 1580
source = "https://gohugo.io/quick-reference/glossary/wrapper-component/"

[params.teach]
difficulty = "参考"
prereq = ["在文档里遇到不认识的 Hugo 术语时查阅"]
outcomes = [
  "判断内容为什么会凭空消失、参数为什么取到空值",
]
next = ["/templates/partial-decorators/"]
+++

_包装组件_（wrapper component）是一种接口模式，它通过组合而非固定参数来包裹其他内容。它提供一个可复用的外壳来处理布局、样式或逻辑，允许调用方模板把任意内容注入组件内部。

另请参见：[_partial decorator_](g)。

## 为什么重要

包装组件的价值是让调用方的 [partial](g) 能把内容「塞进」外壳：组件里输出 `.Inner`，调用时就能在外壳中间写任意内容，而不必把整段 HTML 当参数传进去。忘记输出 `.Inner`，注入的内容会凭空消失且不报错；用字典传参时键名对不上，取到的是 nil，渲染成空白也不会有提示。改这类组件最省事的验证办法是实际调用一次、看渲染结果。

延伸阅读：[局部模板装饰器](/templates/partial-decorators/)、[模板入门](/templates/introduction/)
