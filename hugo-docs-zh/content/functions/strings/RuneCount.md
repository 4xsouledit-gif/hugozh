+++
title = "strings.RuneCount"
linkTitle = "RuneCount"
description = "返回给定字符串中的 rune 数量。"
date = 2026-10-02
weight = 190
source = "https://gohugo.io/functions/strings/runecount/"

[params.functions_and_methods]
signatures = ["strings.RuneCount STRING"]
returnType = "int"
+++

## 这一页解决什么问题

需要知道一段文本**有多少个字符**（而不是多少字节、多少词）时用本函数。它的意义在中英文混排时最明显：`len` 数的是字节，一个汉字占 3 个字节，用它算字数会得到三倍的数字；`strings.RuneCount` 按 rune（等效于一个「字符」）统计。

## 什么时候用，什么时候别用

**该用**：

- 想得到「字符数」，用于显示或做长度上限判断；
- 想知道某个值到底有几个字符（调试时很好用）。

**别用**：

- 想数**非空白**字符数 → 用 [`strings.CountRunes`](/functions/strings/countrunes/)；
- 想数**词**数 → 用 [`strings.CountWords`](/functions/strings/countwords/)；
- 想知道**字节**长度 → 直接用 `len`；
- 想按字符数截断 → 用 [`strings.Substr`](/functions/strings/substr/) 或 [`strings.Truncate`](/functions/strings/truncate/)。

## 用法

[`strings.CountRunes`][] 函数会排除空白字符，而 `strings.RuneCount` 统计字符串中的每一个 rune。

```go-html-template
{{ "Hello, 世界" | strings.RuneCount }} → 9
```

[`strings.CountRunes`]: /functions/strings/countrunes/

## 完整示例（实测）

```go-html-template {file="layouts/_partials/length.html"}
{{ "Hello, 世界" | strings.RuneCount }}|{{ "Hello, 世界" | strings.CountRunes }}
```

Hugo 0.167.0 实测输出：

```text
9|8
```

**你应当看到什么**：`RuneCount` 得 9（含那个空格），`CountRunes` 得 8（排除空格）。两者相差的正是空白字符数。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，单语言站点（`locale = 'zh-CN'`），Windows。

| 输入 | 结果 | 是否报错 |
| --- | --- | --- |
| `"Hello, 世界"` | `9`（6 个 ASCII 字符 + 1 个空格 + 2 个汉字） | 否 |
| `""`（空字符串） | `0` | 否 |
| `"é"`（单个带音调的字符） | `1`（按 rune 计，不按字节计） | 否 |
| `nil` | 上游未说明；本函数签名要求 `STRING` | 上游未说明 |
| 返回类型 | `int`，空串返回 `0` 而不是 `nil` | 否 |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 没报错但结果不对 | 中文标题的字数是目测的 3 倍 | 用了 `len`，它数的是**字节**（一个汉字 3 字节） | 改用本函数或 [`strings.CountRunes`](/functions/strings/countrunes/) |
| 没报错但结果不对 | 与 [`strings.CountRunes`](/functions/strings/countrunes/) 结果差 1 | 差值就是空格、换行等空白字符 | 明确要「含空白」还是「不含空白」，再选函数 |

更多排查入口见[故障排查](/troubleshooting/)。
