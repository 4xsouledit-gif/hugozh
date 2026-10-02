+++
title = "Duration 方法"
linkTitle = "Duration"
description = "在 time.Duration 值上使用这些方法。"
date = 2026-10-02
weight = 10
source = "https://gohugo.io/methods/duration/"
+++

## 这一章解决什么问题

`time.Duration` 是 Hugo 里表示「一段时长」的类型。[`time.ParseDuration`](/functions/time/parseduration/)（时长字符串）与 [`time.Duration`](/functions/time/duration/)（数量 + 单位）负责**造出**它，本章的九个方法负责把它**读出来**：算出多少小时、多少秒，或者按某个单位取整。

时长在模板里通常来自三个地方：两个 `time.Time` 相减（[`time.Time.Sub`](/methods/time/sub/)）的结果、配置项里的超时/间隔，以及 `.ReadingTime` 这类现成的 Duration 值。

## 读完本章你应该能够

- 分清两类方法：**返回数字**的 `Hours`、`Minutes`、`Seconds`、`Milliseconds`、`Microseconds`、`Nanoseconds`，与**返回新 Duration** 的 `Abs`、`Round`、`Truncate`；
- 记住哪些读数方法是浮点数（`Hours`、`Minutes`、`Seconds`），哪些是整数且**小数部分被丢掉**（`Milliseconds`、`Microseconds`、`Nanoseconds`）；
- 用 `Round` 与 `Truncate` 把时长对齐到整小时/整分钟，并说清两者对**负时长**的不同结果；
- 认出最常见的两类报错：值还是字符串没解析成 Duration（`can't evaluate field Hours in type string`）、参数忘了包成 Duration（`expected integer; found "2h"`）。

## 建议阅读顺序

1. **先造一个 Duration**：字符串用 [`time.ParseDuration`](/functions/time/parseduration/)，「数量 + 单位」用 [`time.Duration`](/functions/time/duration/)。没有 Duration，本章的方法一个也用不上。
2. **[Seconds](/methods/duration/seconds/)** —— 最常用的读数方法，先把「时长 → 数字」跑通。
3. **[Hours](/methods/duration/hours/)** 与 **[Minutes](/methods/duration/minutes/)** —— 换单位，注意返回浮点数。
4. **[Milliseconds](/methods/duration/milliseconds/)**、**[Microseconds](/methods/duration/microseconds/)**、**[Nanoseconds](/methods/duration/nanoseconds/)** —— 需要整数时用，注意小数被截掉。
5. **[Abs](/methods/duration/abs/)** —— 只去符号，常用于「相差多久」。
6. **[Round](/methods/duration/round/)** 与 **[Truncate](/methods/duration/truncate/)** —— 对齐到整单位；两页对负时长的行为不同，建议对照阅读。

> [!TIP]
> 本章所有页面的实测数字都用同一个 Duration 复现：`{{ $d := time.ParseDuration "3.5h2.5m1.5s" }}`，它的规范输出是 `3h32m31.5s`（即 12751.5 秒）。自己跑一遍，再对照各页的数字，比背结论可靠。
