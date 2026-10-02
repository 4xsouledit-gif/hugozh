+++
title = "strings.TrimRight"
linkTitle = "TrimRight"
description = "返回给定字符串，并删除 cutset 中指定的结尾字符。"
date = 2026-10-02
weight = 290
source = "https://gohugo.io/functions/strings/trimright/"

[params.functions_and_methods]
signatures = ["strings.TrimRight CUTSET STRING"]
returnType = "string"
+++

## 这一页解决什么问题

要删掉结尾的一类字符：URL 末尾多余的斜杠、文件名末尾的点、数字末尾的零。`strings.TrimRight` 的第二个参数是**字符集合**（cutset），它会从结尾**反复**删除，直到遇到不属于集合的字符为止。

## 什么时候用，什么时候别用

**该用**：

- 要删的是「某一类字符」，且可能出现任意多个（典型场景：`docs/guide///` 这类多斜杠）；
- 想清理格式噪音。

**别用**：

- 要删的是一整段固定后缀 → 用 [`strings.TrimSuffix`](/functions/strings/trimsuffix/)：只删一次完整匹配的后缀；
- 要删首尾两侧 → 用 [`strings.Trim`](/functions/strings/trim/)；
- 要删开头 → 用 [`strings.TrimLeft`](/functions/strings/trimleft/)；
- 只想删空白 → 用 [`strings.TrimSpace`](/functions/strings/trimspace/)。

## 用法

```go-html-template
{{ strings.TrimRight "a" "abba" }} → abb
```

`strings.TrimRight` 函数会在可能的情况下把参数转换为字符串：

```go-html-template
{{ strings.TrimRight 54 12345 }} → 123 (string)
{{ strings.TrimRight "eu" true }} → tr
```

## 完整示例（实测）

```go-html-template {file="layouts/_partials/url.html"}
[{{ strings.TrimRight "/" "docs/guide///" }}]
```

Hugo 0.167.0 实测输出：

```text
[docs/guide]
```

**你应当看到什么**：结尾的三个斜杠被全部删掉（「反复删」的效果），中间和开头的斜杠不受影响。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，单语言站点（`locale = 'zh-CN'`），Windows。

| 输入 | 结果 | 是否报错 |
| --- | --- | --- |
| `{{ strings.TrimRight "/" "docs/guide///" }}` | `docs/guide` | 否 |
| `{{ strings.TrimRight "a" "abba" }}` | `abb` | 否 |
| `{{ strings.TrimRight 54 12345 }}` | `"123"`——参数自动转成字符串，从结尾删掉 `4`、`5` | 否 |
| `{{ strings.TrimRight "eu" true }}` | `"tr"`——`true` 转成 `"true"`，删掉结尾的 `e`、`u` | 否 |
| cutset 里的字符在结尾一个都没有 | 原样返回 | 否 |
| 返回类型 | `string`（即使传入了数字，返回的也是字符串） | 否 |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 没报错但结果不对 | 只想删掉结尾的 `.md`，结果多删了字符 | 本函数按**字符集合**删，`m`、`d`、`.` 都会被反复吃掉 | 删固定后缀改用 [`strings.TrimSuffix`](/functions/strings/trimsuffix/) |
| 没报错但结果不对 | 数字参数结果与预期不符 | 参数自动转字符串后按字符处理（实测 `54`/`12345` → `123`） | 明确使用字符串语义，不要传数字 |
| 没报错但结果不对 | 开头的字符没被删 | 本函数只处理右侧 | 左侧用 [`strings.TrimLeft`](/functions/strings/trimleft/) |

更多排查入口见[故障排查](/troubleshooting/)。
