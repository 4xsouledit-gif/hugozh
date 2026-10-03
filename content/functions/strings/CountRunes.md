+++
title = "strings.CountRunes"
linkTitle = "CountRunes"
description = "返回给定字符串中除空白字符之外的 rune 数量。"
date = 2026-10-02
weight = 70
source = "https://gohugo.io/functions/strings/countrunes/"

[params.functions_and_methods]
signatures = ["strings.CountRunes STRING"]
returnType = "int"
aliases = ["countrunes"]
+++

## 这一页解决什么问题

想显示「这段内容有多少字」，或者想给标题定一个长度上限时，需要的是一个**按字符**数的数字：中文一个字算一个，不是按字节算（一个汉字在 UTF-8 里占 3 字节），也不能把空格和换行算进去。`strings.CountRunes` 返回的就是「排除空白之后的 rune 数量」。

## 什么时候用，什么时候别用

**该用**：

- 估算阅读量、显示字数、做「标题不超过 N 字」的软校验；
- 文本里可能有中文、日文、emoji 等多字节字符，不想被字节数误导。

**别用**：

- 想连同空白一起数 → 用 [`strings.RuneCount`](/functions/strings/runecount/)；
- 想知道**字节**长度（例如判断 HTTP 头部大小）→ 直接用 `len`；
- 想数单词数 → 用 [`strings.CountWords`](/functions/strings/countwords/)；
- 想按字数截断 → 用 [`strings.Substr`](/functions/strings/substr/) 或 [`strings.Truncate`](/functions/strings/truncate/)。

## 用法

[`strings.RuneCount`][] 函数统计字符串中的每一个 rune，而 `strings.CountRunes` 会排除空白字符。

```go-html-template
{{ "Hello, 世界" | strings.CountRunes }} → 8
```

[`strings.RuneCount`]: /functions/strings/runecount/

## 完整示例（实测）

```go-html-template {file="layouts/_partials/length.html"}
{{ $s := "Hello, 世界" }}
CountRunes：{{ strings.CountRunes $s }}，RuneCount：{{ strings.RuneCount $s }}
```

Hugo 0.167.0 实测输出：

```text
CountRunes：8，RuneCount：9
```

**你应当看到什么**：两个数字只差 1，那个差额就是中间的空格。`Hello,` 是 6 个字符，`世界` 是 2 个字符，共 8 个非空白字符；加上空格就是 9 个 rune。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，单语言站点（`locale = 'zh-CN'`），Windows。

| 输入 | 结果 | 是否报错 |
| --- | --- | --- |
| `{{ "Hello, 世界" | strings.CountRunes }}` | `8` | 否 |
| `{{ "  " | strings.CountRunes }}` | `0`（全是空白） | 否 |
| `{{ "" | strings.CountRunes }}` | `0` | 否 |
| 全角标点、emoji 等多字节字符 | 各算 1（按 rune 计，不按字节计） | 否 |
| 返回类型 | `int`，永远不会有负值；空白串返回 `0` 而不是 `nil` | 否 |

对照记忆：[`strings.RuneCount`](/functions/strings/runecount/) 数「有多少个字符」，本函数数「有多少个**可见**字符」。

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 没报错但结果不对 | 中文标题的「字数」远超预期 | 用 `len` 数的是字节，一个汉字 3 字节 | 改用本函数或 [`strings.RuneCount`](/functions/strings/runecount/) |
| 没报错但结果不对 | 字数比目测少 | 本函数把空白排除了（实测 `"  "` 得 `0`） | 要连空白一起数就用 [`strings.RuneCount`](/functions/strings/runecount/) |

更多排查入口见[故障排查](/troubleshooting/)。
