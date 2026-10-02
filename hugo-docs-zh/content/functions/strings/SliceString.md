+++
title = "strings.SliceString"
linkTitle = "SliceString"
description = "返回给定字符串的子串，从起始位置开始，到结束位置之前结束。"
date = 2026-10-02
weight = 200
source = "https://gohugo.io/functions/strings/slicestring/"

[params.functions_and_methods]
signatures = ["strings.SliceString STRING [START] [END]"]
returnType = "string"
aliases = ["slicestr"]
+++

## 这一页解决什么问题

要按「位置区间」取字符串的一段：从第 3 个字符到第 6 个字符之前。`strings.SliceString` 的参数是**半开区间** `[START, END)`——`END` 位置的字符**不**包含在内，这一点与 [`strings.Substr`](/functions/strings/substr/) 的「起始位置 + 长度」是两种完全不同的记法。

## 什么时候用，什么时候别用

**该用**：

- 已经在按「区间」思考（例如「第 3 到第 6 个字符」）；
- 要取到字符串末尾，省略 `END` 即可。

**别用**：

- 想的是「从第 N 个字符起取 M 个字符」→ 用 [`strings.Substr`](/functions/strings/substr/) 更自然，也不容易越界；
- 想截断成固定长度并补省略号、且不切断单词 → 用 [`strings.Truncate`](/functions/strings/truncate/)；
- 想按分隔符切分 → 用 [`strings.Split`](/functions/strings/split/)。

> [!WARNING]
> 本函数对越界最不宽容：起点超过字符串长度、或 `END` 小于 `START`，都会**直接让构建失败**（实测见下文）。如果你的区间是算出来的，建议改用 [`strings.Substr`](/functions/strings/substr/)。

## 用法

START 与 END 位置从 0 开始计数，`0` 表示字符串的第一个字符。如果不指定 START，子串从位置 `0` 开始；如果不指定 END，子串在最后一个字符之后结束。

```go-html-template
{{ slicestr "BatMan" }} → BatMan
{{ slicestr "BatMan" 3 }} → Man
{{ slicestr "BatMan" 0 3 }} → Bat
```

START 与 END 参数表示一个半开区间（half-open interval）的两个端点，这个概念初次接触时可能不太好理解。你可能会觉得 [`strings.Substr`][] 函数更容易掌握。

[`strings.Substr`]: /functions/strings/substr/

## 完整示例（实测）

```go-html-template {file="layouts/_partials/slice.html"}
{{ slicestr "BatMan" 3 }}|{{ slicestr "BatMan" 0 3 }}
```

Hugo 0.167.0 实测输出：

```text
Man|Bat
```

**你应当看到什么**：`slicestr "BatMan" 3` 从下标 3 取到末尾，得 `Man`；`slicestr "BatMan" 0 3` 取下标 0、1、2 三个字符，得 `Bat`——下标 3 的 `M` **不在**结果里，这就是半开区间。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，单语言站点（`locale = 'zh-CN'`），Windows。

| 输入 | 结果 | 是否报错 |
| --- | --- | --- |
| `{{ slicestr "BatMan" 2 6 }}` | `tMan`（`END` 等于长度是合法的） | 否 |
| `{{ slicestr "汉字测试" 0 2 }}` | `汉字`（按 rune 取，不会切坏多字节字符） | 否 |
| 省略 `START` / 省略 `END` | 分别从 0 开始 / 取到末尾（上游示例） | 否 |
| `{{ slicestr "" 0 0 }}` | —— | **是，构建失败**：`error calling slicestr: slice bounds out of range` |
| `{{ slicestr "BatMan" 100 }}`（起点超过长度） | —— | **是，构建失败**：`error calling slicestr: slice bounds out of range` |
| `{{ slicestr "BatMan" 3 1 }}`（END 小于 START） | —— | **是，构建失败**：`error calling slicestr: runtime error: slice bounds out of range [3:1]` |
| 返回类型 | `string` | 否 |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 报错看不懂 | `slice bounds out of range`，整站构建失败 | 起点超过长度，或 `END < START`（实测空字符串 `0 0` 也会失败） | 换成 [`strings.Substr`](/functions/strings/substr/)（越界时返回空或截断，不报错），或先算好边界再传 |
| 没报错但结果不对 | 少取了一个字符 | 区间是半开的，`END` 位置的字符不包含 | 想要「取到第 N 个」就传 `N+1` |
| 没报错但结果不对 | 与 [`strings.Substr`](/functions/strings/substr/) 结果不一致 | 两者第三个参数含义不同：本函数是「结束位置」，`Substr` 是「长度」 | 明确用哪一种记法，不要混用 |

更多排查入口见[故障排查](/troubleshooting/)。
