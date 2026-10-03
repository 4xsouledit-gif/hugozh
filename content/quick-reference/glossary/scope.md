+++
title = "作用域（scope）"
linkTitle = "作用域"
description = "变量或对象可被访问的特定代码区域。"
date = 2026-10-02
weight = 1200
source = "https://gohugo.io/quick-reference/glossary/scope/"

[params.teach]
difficulty = "参考"
prereq = ["在文档里遇到不认识的 Hugo 术语时查阅"]
outcomes = ["能定位模板里 `undefined variable` 一类报错的作用域原因，并知道变量该定义在哪一层"]
next = ["/templates/introduction/"]
+++

作用域（scope）指 [variable](g) 或 [object](g) 可被访问的特定代码区域。例如，在一个 [template](g) 中初始化的变量在另一个模板中不可用。

## 为什么重要

变量只在定义它的作用域内可见：`{{ $x := ... }}` 写在 `{{ if }}`、`{{ range }}`、`{{ with }}` 块里，块外就读不到，[partial](g) 也不会继承调用方的变量。看到 `undefined variable`，或者「块内改了、块外没变」，先检查变量的定义位置；需要跨层读取时用 `$` 引用外层上下文。

延伸阅读：[模板简介](/templates/introduction/)
