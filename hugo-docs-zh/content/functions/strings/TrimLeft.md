+++
title = "strings.TrimLeft"
linkTitle = "TrimLeft"
description = "返回给定字符串，并删除 cutset 中指定的开头字符。"
date = 2026-10-02
weight = 270
source = "https://gohugo.io/functions/strings/trimleft/"

[params.functions_and_methods]
signatures = ["strings.TrimLeft CUTSET STRING"]
returnType = "string"
+++

## 这一页解决什么问题

要删掉开头的一类字符，而不是某一段固定文本：路径前面的多余斜杠 `//docs/`、数字前面的零 `007`、字符串前面的引号或短横。`strings.TrimLeft` 的第二个参数是**字符集合**（cutset），它会从开头**反复**删除，直到遇到不属于集合的字符为止。

## 什么时候用，什么时候别用

**该用**：

- 要删的是「某一类字符」，且可能出现任意多个；
- 想清理格式噪音（多余斜杠、前导零、包裹符号）。

**别用**：

- 要删的是一整段固定前缀 → 用 [`strings.TrimPrefix`](/functions/strings/trimprefix/)：它只删一次完整匹配的前缀，语义更准确；
- 要删首尾两侧 → 用 [`strings.Trim`](/functions/strings/trim/)；
- 要删结尾 → 用 [`strings.TrimRight`](/functions/strings/trimright/)；
- 只想删空白 → 用 [`strings.TrimSpace`](/functions/strings/trimspace/)。

## 用法

```go-html-template
{{ strings.TrimLeft "a" "abba" }} → bba
```

`strings.TrimLeft` 函数会在可能的情况下把参数转换为字符串：

```go-html-template
{{ strings.TrimLeft 21 12345 }} → 345 (string)
{{ strings.TrimLeft "rt" true }} → ue
```

## 完整示例（实测）

```go-html-template {file="layouts/_partials/path.html"}
[{{ strings.TrimLeft "/" "//docs/guide/" }}]
```

Hugo 0.167.0 实测输出：

```text
[docs/guide/]
```

**你应当看到什么**：开头的两个斜杠都被删了（这是「反复删」的效果），**结尾**的斜杠原样保留——本函数只处理左侧。需要结尾也处理就再套一个 [`strings.TrimRight`](/functions/strings/trimright/)。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，单语言站点（`locale = 'zh-CN'`），Windows。

| 输入 | 结果 | 是否报错 |
| --- | --- | --- |
| `{{ strings.TrimLeft "/" "//docs/guide/" }}` | `docs/guide/` | 否 |
| `{{ strings.TrimLeft "a" "abba" }}` | `bba` | 否 |
| `{{ strings.TrimLeft 21 12345 }}` | `"345"`——参数自动转成字符串，删除开头的 `1`、`2` | 否 |
| `{{ strings.TrimLeft "rt" true }}` | `"ue"`——`true` 转成 `"true"`，删掉开头的 `t`、`r` | 否 |
| cutset 里的字符在开头一个都没有 | 原样返回 | 否 |
| 返回类型 | `string`（即使传入了数字，返回的也是字符串） | 否 |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 没报错但结果不对 | `"docs/guide/"` 想只去掉开头的 `docs/`，结果把结尾也动了 | 本函数按**字符集合**反复删，`docs` 里每个字符都在集合内都会被吃掉 | 删固定前缀改用 [`strings.TrimPrefix`](/functions/strings/trimprefix/) |
| 没报错但结果不对 | 数字开头的字符串结果不对 | 参数被自动转成字符串后按字符处理（实测 `21`/`12345` → `345`） | 明确要用字符串语义，避免传数字 |
| 没报错但结果不对 | 结尾的字符没被删 | 本函数只处理左侧 | 右侧用 [`strings.TrimRight`](/functions/strings/trimright/) |

更多排查入口见[故障排查](/troubleshooting/)。
