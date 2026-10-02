+++
title = "空操作（noop）"
linkTitle = "空操作"
description = "不做任何事情的语句，no operation 的缩写。"
date = 2026-10-02
weight = 810
source = "https://gohugo.io/quick-reference/glossary/noop/"

[params.teach]
difficulty = "参考"
prereq = ["在文档里遇到不认识的 Hugo 术语时查阅"]
outcomes = ["能认出模板里有意为之的 `$noop` 变量，并判断它是在触发什么副作用"]
next = ["/methods/page/store/"]
+++

空操作（noop）是「no operation」的缩写形式，指不做任何事情的语句。

## 为什么重要

Hugo 模板里最常见的 noop 用法，是把值赋给一个此后不再使用的变量来触发副作用，例如 `{{ $noop := .Content }}`：取 `.Content` 会真的渲染内容，之后用 `.Store.Get` 检查标记才能拿到正确结果。需要取值但又不想让它出现在输出里时，也只能这样写。看到以 `$noop` 命名的变量不要当成笔误，它是有意为之的占位。

延伸阅读：[Store](/methods/page/store/)、[Content](/methods/page/content/)
