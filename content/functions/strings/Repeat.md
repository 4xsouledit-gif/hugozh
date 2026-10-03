+++
title = "strings.Repeat"
linkTitle = "Repeat"
description = "返回把给定字符串重复指定次数后的结果。"
date = 2026-10-02
weight = 150
source = "https://gohugo.io/functions/strings/repeat/"

[params.functions_and_methods]
signatures = ["strings.Repeat COUNT STRING"]
returnType = "string"
+++

## 这一页解决什么问题

需要一段「重复出来」的文本：分隔线、占位符、缩进、评分星级。`strings.Repeat` 把同一个字符串拼 `COUNT` 次，参数顺序是**次数在前、内容在后**（`{{ strings.Repeat 3 "yo" }}`）。

## 什么时候用，什么时候别用

**该用**：

- 重复**同一个**字符串若干次；
- 结果长度可以按次数直接算出来（本函数不做任何宽度对齐）。

**别用**：

- 把**切片**里的多个元素拼成一个字符串 → 用 [`collections.Delimit`](/functions/collections/delimit/)；
- 想按「总宽度」补齐空格 → 用 [`fmt.Printf`](/functions/fmt/printf/) 的 `%*s`，它可以直接指定宽度；
- 想拼接两个不同的字符串 → 用 [`fmt.Print`](/functions/fmt/print/) 或 `printf`。

## 用法

```go-html-template
{{ strings.Repeat 3 "yo" }} → yoyoyo
```

## 完整示例（实测）

```go-html-template {file="layouts/_partials/rule.html"}
{{ strings.Repeat 3 "=-" }}
```

Hugo 0.167.0 实测输出：

```text
=-=-=-
```

**你应当看到什么**：`=-` 被原样拼了 3 次。注意它不会在末尾补一个「收尾」字符——要对称的分隔线就得自己把内容写成 `=-=`。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，单语言站点（`locale = 'zh-CN'`），Windows。

| 输入 | 结果 | 是否报错 |
| --- | --- | --- |
| `{{ strings.Repeat 3 "yo" }}` | `yoyoyo` | 否 |
| `{{ strings.Repeat 0 "yo" }}` | `""`（空字符串） | 否 |
| `{{ strings.Repeat 2 "汉字" }}` | `汉字汉字`（按整个字符串重复，不是按字符） | 否 |
| `{{ strings.Repeat -1 "yo" }}` | —— | **是，构建失败**：`error calling Repeat: strings: negative Repeat count` |
| 返回类型 | `string`，`COUNT` 为 `0` 时是空串而不是 `nil` | 否 |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 报错看不懂 | `strings: negative Repeat count`，整站构建失败 | `COUNT` 是负数（例如由减法算出来的） | 计算次数时先保证不为负，或用 `math.Max` 兜底 |
| 没报错但结果不对 | 分隔线长度不对 | 次数是「重复几遍」，不是「总长度」 | 按 `总长度 ÷ 单段长度` 自己算次数 |
| 没报错但结果不对 | 想拼一个切片却只得到 `[a b c]` 这样的文本 | `Repeat` 只重复一个字符串，不适合拼接切片 | 拼接切片用 [`collections.Delimit`](/functions/collections/delimit/) |

更多排查入口见[故障排查](/troubleshooting/)。
