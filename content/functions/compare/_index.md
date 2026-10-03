+++
title = "比较函数"
linkTitle = "compare"
description = "使用这些函数比较两个或多个值。"
date = 2026-10-02
weight = 30
source = "https://gohugo.io/functions/compare/"
+++

模板里的 `if` 需要一个布尔值，而布尔值几乎都来自比较。这一章的函数就是把「相等 / 大于 / 小于」和「二选一 / 兜底」变成布尔值或取值表达式。

读这一章最容易踩的两条：**数字与字符串的比较规则并不统一**（`eq 1 "1"` 为假，而 `gt 2 "1"` 为真），以及**多参数语义不同**（`eq` 是「等于任一」，`ne`、`gt`、`ge`、`lt`、`le` 是「对全部成立」）。每页的「返回值边界（实测）」表都把这两点单列出来。

## 读完本章你应该能够

- 在 `eq`、`ne`、`ge`、`gt`、`le`、`lt` 之间按语义选对函数，并说清「包含相等」的是哪几个；
- 判断数字、数字字符串、不可解析字符串、`nil`、切片/映射分别会得到什么结果（以及会不会报错）；
- 用 `compare.Default` 给缺失参数兜底，并知道 `false` 与 `"0"` 这两个反直觉的特例；
- 用 `compare.Conditional` 在「只能写一个表达式」的位置做二选一，并知道它**没有短路求值**。

## 建议阅读顺序

1. **[compare.Default](/functions/compare/default/)** —— 最先会用到：参数缺失时的兜底。
2. **[compare.Eq](/functions/compare/eq/)** / **[compare.Ne](/functions/compare/ne/)** —— 相等与不等，注意数字与字符串不同型的规则。
3. **[compare.Ge](/functions/compare/ge/)** / **[compare.Gt](/functions/compare/gt/)** / **[compare.Le](/functions/compare/le/)** / **[compare.Lt](/functions/compare/lt/)** —— 四个大小比较，先弄清「包含相等」的边界。
4. **[compare.Conditional](/functions/compare/conditional/)** —— 三目运算符的替代品，也是本章唯一会「两个分支都求值」的函数。

> [!TIP]
> 只想快速查某个比较返回什么，直接跳到各页的「返回值边界（实测）」表格，那里的每一行都在 Hugo 0.167.0 上跑过。
