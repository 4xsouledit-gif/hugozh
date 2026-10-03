+++
title = "strings.Trim"
linkTitle = "Trim"
description = "返回给定字符串，并删除 cutset 中指定的首尾字符。"
date = 2026-10-02
weight = 260
source = "https://gohugo.io/functions/strings/trim/"

[params.functions_and_methods]
signatures = ["strings.Trim STRING CUTSET"]
returnType = "string"
aliases = ["trim"]
+++

## 这一页解决什么问题

要同时清掉一首一尾的「包装字符」：字符串两端的引号、括号、短横、下划线。`strings.Trim` 的第二个参数是**字符集合**（cutset），它从两侧**反复**删除集合里出现的字符，直到两侧都不再是集合中的字符为止。

## 什么时候用，什么时候别用

**该用**：

- 首尾要删的是同一类字符，且可能出现任意多个；
- 想一次处理两端（`++foo--` 这种两侧符号不同的情况也能处理，只要把符号都写进 cutset）。

**别用**：

- 要删的是一整段固定前缀或后缀 → 用 [`strings.TrimPrefix`](/functions/strings/trimprefix/)、[`strings.TrimSuffix`](/functions/strings/trimsuffix/)：它们只删一次完整匹配，语义更准确；
- 只想删空白 → 用 [`strings.TrimSpace`](/functions/strings/trimspace/)；
- 只想删一侧 → 用 [`strings.TrimLeft`](/functions/strings/trimleft/)、[`strings.TrimRight`](/functions/strings/trimright/)。

## 用法

```go-html-template
{{ trim "++foo--" "+-" }} → foo
```

## 完整示例（实测）

```go-html-template {file="layouts/_partials/unquote.html"}
[{{ trim "\"hello\"" "\"" }}]
```

Hugo 0.167.0 实测输出：

```text
[hello]
```

**你应当看到什么**：两端的双引号都被删掉，只剩 `hello`。方括号是测试时加的，用来让首尾是否干净「看得见」。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，单语言站点（`locale = 'zh-CN'`），Windows。

| 输入 | 结果 | 是否报错 |
| --- | --- | --- |
| `{{ trim "++foo--" "+-" }}` | `foo` | 否 |
| `{{ trim "abcba" "ab" }}` | `c`——cutset 是**字符集合**，两端会被反复删 | 否 |
| `{{ trim "  x  " " " }}` | `x` | 否 |
| `{{ trim "abc" "xyz" }}` | `abc`——没有可删的字符时原样返回 | 否 |
| `{{ trim "" "x" }}` | `""` | 否 |
| 返回类型 | `string`，永远不是 `nil` | 否 |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 没报错但结果不对 | `abcba` 想只删掉首尾的 `a`，结果只剩 `c` | cutset 是集合且会反复删，`b` 也在集合里 | 只删固定文本用 [`strings.TrimPrefix`](/functions/strings/trimprefix/) / [`strings.TrimSuffix`](/functions/strings/trimsuffix/) |
| 没报错但结果不对 | 中间的字符也期望被删 | 本函数只处理首尾 | 中间字符用 [`strings.Replace`](/functions/strings/replace/) 或 [`strings.ReplaceRE`](/functions/strings/replacere/) |
| 没报错但结果不对 | 想删的其实是空白，但空格没被清理干净 | cutset 里没写全（例如漏了制表符） | 空白相关一律用 [`strings.TrimSpace`](/functions/strings/trimspace/) |

更多排查入口见[故障排查](/troubleshooting/)。
