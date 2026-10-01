+++
title = "Scratch"
linkTitle = "Scratch"
description = "返回一个持久化的数据结构，用于存储和操作带 key 的值，作用域为当前短代码。"
date = 2026-10-02
weight = 130
source = "https://gohugo.io/methods/shortcode/scratch/"

[params.functions_and_methods]
signatures = ["SHORTCODE.Scratch"]
returnType = "maps.Scratch"
+++

**（0.139.0 起弃用）**

请改用 [`SHORTCODE.Store`](/methods/shortcode/store/) 方法。

这是一次软弃用。该方法会在将来的某个版本中移除，但移除日期尚未确定。尽管你继续使用该方法时 Hugo 不会发出警告，但你应该尽快开始使用 `SHORTCODE.Store`。

从 v0.139.0 开始，`SHORTCODE.Scratch` 方法已成为 `SHORTCODE.Store` 的别名。
