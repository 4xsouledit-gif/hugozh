+++
title = "strings.Substr"
linkTitle = "Substr"
description = "返回给定字符串的子串，从起始位置开始，到给定长度之后结束。"
date = 2026-10-02
weight = 220
source = "https://gohugo.io/functions/strings/substr/"

[params.functions_and_methods]
signatures = ["strings.Substr STRING [START] [LENGTH]"]
returnType = "string"
aliases = ["substr"]
+++

## 这一页解决什么问题

按「从第几个字符开始、取多少个字符」的方式取一段文本：取摘要的前 100 个字符、去掉结尾的扩展名、从字符串末尾往前取 4 位。`strings.Substr` 的记法是**起始位置 + 长度**，负数的含义也各有约定，比 [`strings.SliceString`](/functions/strings/slicestring/) 的区间记法更接近日常说话。

## 什么时候用，什么时候别用

**该用**：

- 想的是「起始位置 + 长度」，或「从末尾往前取」；
- 越界时希望**不报错**（本函数会截断或返回空串，见下文实测）。

**别用**：

- 想的是「某个区间 `[start, end)`」→ 用 [`strings.SliceString`](/functions/strings/slicestring/)；
- 想截断成固定长度、不切断单词、并补省略号 → 用 [`strings.Truncate`](/functions/strings/truncate/)；
- 想按分隔符取其中一段 → 用 [`strings.Split`](/functions/strings/split/)；
- 想删开头/结尾的固定文本 → 用 [`strings.TrimPrefix`](/functions/strings/trimprefix/)、[`strings.TrimSuffix`](/functions/strings/trimsuffix/)。

## 用法

起始位置从 0 开始计数，`0` 表示字符串的第一个字符。如果不指定 START，子串从位置 `0` 开始。START 为负数时，从字符串末尾开始提取字符。

如果不指定 LENGTH，子串包含从 START 位置到字符串末尾的所有字符。LENGTH 为负数时，将从字符串末尾略去相应数量的字符。

```go-html-template
{{ substr "abcdef" 0 }} → abcdef
{{ substr "abcdef" 1 }} → bcdef

{{ substr "abcdef" 0 1 }} → a
{{ substr "abcdef" 1 1 }} → b

{{ substr "abcdef" 0 -1 }} → abcde
{{ substr "abcdef" 1 -1 }} → bcde

{{ substr "abcdef" -1 }} → f
{{ substr "abcdef" -2 }} → ef

{{ substr "abcdef" -1 1 }} → f
{{ substr "abcdef" -2 1 }} → e

{{ substr "abcdef" -3 -1 }} → de
{{ substr "abcdef" -3 -2 }} → d
```

## 完整示例（实测）

```go-html-template {file="layouts/_partials/excerpt.html"}
{{ substr "abcdef" 0 3 }}|{{ substr "abcdef" -2 }}|{{ substr "汉字测试文本" 0 2 }}
```

Hugo 0.167.0 实测输出：

```text
abc|ef|汉字
```

**你应当看到什么**：第一项从 0 取 3 个字符；第二项 `-2` 表示从末尾往前取，得最后 2 个字符；第三项说明中文也按**字符**取，不会把汉字切坏（`汉字` 而不是半个字）。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，单语言站点（`locale = 'zh-CN'`），Windows。

| 输入 | 结果 | 是否报错 |
| --- | --- | --- |
| `{{ substr "abcdef" 100 }}`（起点超过长度） | `""`（空字符串） | **否**——这一点与 [`strings.SliceString`](/functions/strings/slicestring/) 不同 |
| `{{ substr "abcdef" 3 100 }}`（长度超过剩余） | `def`（截断到末尾） | 否 |
| `{{ substr "abcdef" -100 }}`（负数超出长度） | `abcdef`，取整串 | 否 |
| `{{ substr "abcdef" 0 -100 }}`（要略去的数量超过总长） | `""`（空字符串） | 否 |
| `{{ substr "abcdef" 2 -1 }}` | `cde` | 否 |
| 中文（实测 `substr "汉字测试文本" 0 2`） | `汉字`，按字符取 | 否 |
| `LENGTH` 为负（上游示例 `substr "abcdef" 0 -1`） | `abcde`，从末尾略去 1 个字符 | 否 |
| 返回类型 | `string`；越界时是空串而不是 `nil` | 否 |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 没报错但结果不对 | 取出来是空字符串 | 起点超过了字符串长度；本函数不报错，只返回空串（实测起点 `100` 得空串） | 先用 [`strings.RuneCount`](/functions/strings/runecount/) 判断长度，或改用 [`strings.Truncate`](/functions/strings/truncate/) |
| 没报错但结果不对 | 与 [`strings.SliceString`](/functions/strings/slicestring/) 结果不一致 | 第三个参数含义不同：本函数是**长度**，`SliceString` 是**结束位置** | 固定用一种记法，中文注释写清楚 |
| 没报错但结果不对 | 负数结果与预期不符 | `START` 负数表示「从末尾数起」，`LENGTH` 负数表示「从末尾略去」 | 对照本页上游示例表确认方向 |

更多排查入口见[故障排查](/troubleshooting/)。
