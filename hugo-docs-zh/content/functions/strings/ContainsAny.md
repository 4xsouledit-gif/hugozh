+++
title = "strings.ContainsAny"
linkTitle = "ContainsAny"
description = "报告给定字符串是否包含指定字符集合中的任意字符。"
date = 2026-10-02
weight = 40
source = "https://gohugo.io/functions/strings/containsany/"

[params.functions_and_methods]
signatures = ["strings.ContainsAny STRING SET"]
returnType = "bool"
+++

## 这一页解决什么问题

有时要判断的不是「有没有这一整段子串」，而是「有没有这一类字符中的任意一个」：路径里有没有分隔符、用户输入里有没有引号、标题里有没有标点。`strings.ContainsAny` 的第二个参数是一个**字符集合**（`SET`），只要 `STRING` 里出现其中任何一个字符就返回 `true`。

## 什么时候用，什么时候别用

**该用**：

- 集合里的字符很多、且彼此独立（例如 `"/\\"`、`"'\"`）；
- 想快速做一次「含不含特殊字符」的初筛。

**别用**：

- 要判断一整段子串 → 用 [`strings.Contains`](/functions/strings/contains/)；
- 只关心开头或结尾的固定文本 → 用 [`strings.HasPrefix`](/functions/strings/hasprefix/) / [`strings.HasSuffix`](/functions/strings/hassuffix/)；
- 判断是否是空白 → 用 [`strings.ContainsNonSpace`](/functions/strings/containsnonspace/)（`SET` 是字符集合，写 `" "` 只能测出「恰好有空格」，测不出制表符和换行）；
- 要按模式匹配（字符类、重复次数）→ 用 [`strings.FindRE`](/functions/strings/findre/)。

## 用法

```go-html-template
{{ strings.ContainsAny "Hugo" "gm" }} → true
```

该检查区分大小写：

```go-html-template
{{ strings.ContainsAny "Hugo" "Gm" }} → false
```

## 完整示例（实测）

```go-html-template {file="layouts/_partials/path-check.html"}
{{ $path := "docs/guide.md" }}
含分隔符：{{ strings.ContainsAny $path "/\\" }}，含 xyz：{{ strings.ContainsAny $path "xyz" }}
```

Hugo 0.167.0 实测输出：

```text
含分隔符：true，含 xyz：false
```

**你应当看到什么**：`/` 在 `$path` 里出现过，所以第一项为 `true`；`xyz` 里的三个字符一个都没出现，所以第二项为 `false`。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，单语言站点（`locale = 'zh-CN'`），Windows。

| 输入 | 结果 | 是否报错 |
| --- | --- | --- |
| `{{ strings.ContainsAny "Hugo" "gm" }}` | `true` | 否 |
| `{{ strings.ContainsAny "Hugo" "Gm" }}` | `false`（区分大小写） | 否 |
| `{{ strings.ContainsAny "汉字" "字" }}` | `true` | 否 |
| `{{ strings.ContainsAny "abc" "" }}` | `false`（空集合不匹配任何字符） | 否 |
| `SET` 里有重复或顺序不同 | 不影响结果（它是集合，不是子串） | 否 |
| 返回类型 | `bool`，永远不会是 `nil` | 否 |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 没报错但结果不对 | 明明含 `abc` 却返回 `false` | 把 `SET` 当成了子串：它是**字符集合**，`"abc"` 表示 a、b、c 三个字符任一个 | 判断整段子串改用 [`strings.Contains`](/functions/strings/contains/) |
| 没报错但结果不对 | 用 `" "` 判断「有没有空白」漏掉了制表符 | 空格是一个字符，`\t`/`\n` 不在集合里 | 空白相关的判断改用 [`strings.ContainsNonSpace`](/functions/strings/containsnonspace/) |

更多排查入口见[故障排查](/troubleshooting/)。
