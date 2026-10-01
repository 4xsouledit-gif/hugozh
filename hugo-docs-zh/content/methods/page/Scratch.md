+++
title = "Scratch"
linkTitle = "Scratch"
description = "返回一个持久化的数据结构，用于存储和操作带 key 的值，作用域为当前页面。"
date = 2026-10-02
weight = 730
source = "https://gohugo.io/methods/page/scratch/"

[params.functions_and_methods]
signatures = ["PAGE.Scratch"]
returnType = "maps.Scratch"
+++

**（0.138.0 起弃用）**

请改用 [`PAGE.Store`](/methods/page/store/) 方法。

这是一次软弃用。该方法会在将来的某个版本中移除，但移除日期尚未确定。尽管你继续使用该方法时 Hugo 不会发出警告，但你应该尽快开始使用 `PAGE.Store`。

从 v0.138.0 开始，`PAGE.Scratch` 方法已成为 `PAGE.Store` 的别名。
