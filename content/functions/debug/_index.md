+++
title = "调试函数"
linkTitle = "debug"
description = "把模板里的中间值打出来：dump、timer、visualizeSpaces，排查「拿到的值不对」或「构建变慢」。"
date = 2026-10-02
weight = 60
source = "https://gohugo.io/functions/debug/"

[params.teach]
difficulty = "参考"
time = "按需查阅"
prereq = [
  "已经在写模板，且遇到过「构建没报错、但输出不对」的情况。",
]
outcomes = [
  "用 `debug.Dump` 把任意值的结构与类型打出来，而不是靠猜；",
  "用 `debug.Timer` 测某段模板耗时，配合 [`--templateMetrics`](https://gohugo.io/commands/hugo/) 找构建变慢的原因；",
  "用 `debug.VisualizeSpaces` 看出「看不见的空白字符」在哪里作怪。",
]
next = ["/troubleshooting/inspection/", "/functions/fmt/warnf/"]
+++

## 这一组包含什么

| 函数 | 用途 |
| --- | --- |
| [`Dump`](/functions/debug/dump/) | 打印值的完整结构与类型，排查「这个变量到底是什么」 |
| [`Timer`](/functions/debug/timer/) | 测量一段模板的执行耗时，输出到日志 |
| [`VisualizeSpaces`](/functions/debug/visualizespaces/) | 把空白字符可视化，排查「多了个空格/换行导致输出不对」 |

## 什么时候用

- 模板里取到的值与预期不符、但构建没有报错 → **先用 `debug.Dump`**，不要凭印象改模板；
- 构建越来越慢、怀疑某段模板 → 用 `debug.Timer` 量一下，再决定要不要优化；
- 输出里出现莫名其妙的空隙 → `debug.VisualizeSpaces`。

系统的排查顺序（先确认输入、再确认模板、最后确认产物）见[检查与调试](/troubleshooting/inspection/)；需要在不中断构建的前提下留下线索时用 [`warnf` / `errorf`](/functions/fmt/warnf/)。

下方列出本站收录的本组全部函数。
