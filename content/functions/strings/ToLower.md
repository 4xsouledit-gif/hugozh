+++
title = "strings.ToLower"
linkTitle = "ToLower"
description = "返回给定字符串，并把所有字符转为小写。"
date = 2026-10-02
weight = 240
source = "https://gohugo.io/functions/strings/tolower/"

[params.functions_and_methods]
signatures = ["strings.ToLower STRING"]
returnType = "string"
aliases = ["lower"]
+++

## 这一页解决什么问题

做**不区分大小写**的比较，或把一段文本统一成小写外观：判断两个标签是不是同一个、生成 CSS 类名、归一化用户输入。`strings.ToLower` 把**所有**字符转成小写（只想动第一个字符请用 [`strings.FirstLower`](/functions/strings/firstlower/)）。

## 什么时候用，什么时候别用

**该用**：

- 比较之前先归一化：`{{ if eq (lower $a) (lower $b) }}`；
- 输出需要全小写的标识符、类名。

**别用**：

- 生成 URL 的 slug → 用 [`urls.URLize`](/functions/urls/urlize/)：它会同时处理空格、标点与百分号编码，`lower` 不处理这些；
- 只把首字符转小写 → 用 [`strings.FirstLower`](/functions/strings/firstlower/)；
- 想要标题式大小写 → 用 [`strings.Title`](/functions/strings/title/)。

## 用法

```go-html-template
{{ lower "BatMan" }} → batman
```

## 完整示例（实测）

```go-html-template {file="layouts/_partials/normalize.html"}
{{ lower "BatMan" }}
```

Hugo 0.167.0 实测输出：

```text
batman
```

**你应当看到什么**：整串都被转换，`B` 和 `M` 都变成小写。中文不受影响（实测 `lower "汉字ABC"` → `汉字abc`）。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，单语言站点（`locale = 'zh-CN'`），Windows。

| 输入 | 结果 | 是否报错 |
| --- | --- | --- |
| `"BatMan"` | `batman` | 否 |
| `"汉字ABC"` | `汉字abc`（非拉丁字符原样保留） | 否 |
| `""`（空字符串） | `""` | 否 |
| 已经是小写的字符串 | 原样返回 | 否 |
| 返回类型 | `string`，永远不是 `nil` | 否 |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 没报错但结果不对 | 大小写比较仍然失败 | 只归一化了其中一边（或用了 [`strings.Contains`](/functions/strings/contains/) 这类本身就区分大小写的函数） | 两边都先 `lower` 再比较；包含判断也要对两边同时处理 |
| 没报错但结果不对 | slug 里出现空格或百分号 | `lower` 只处理大小写，不处理空格与特殊字符 | 生成 slug 用 [`urls.URLize`](/functions/urls/urlize/) |
| 没报错但结果不对 | 只想要第一个字母小写 | 本函数会把整串都变小写 | 改用 [`strings.FirstLower`](/functions/strings/firstlower/) |

更多排查入口见[故障排查](/troubleshooting/)。
