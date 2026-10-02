+++
title = "strings.ContainsNonSpace"
linkTitle = "ContainsNonSpace"
description = "报告给定字符串是否包含 Unicode 定义的非空白字符。"
date = 2026-10-02
weight = 50
source = "https://gohugo.io/functions/strings/containsnonspace/"

[params.functions_and_methods]
signatures = ["strings.ContainsNonSpace STRING"]
returnType = "bool"
+++

## 这一页解决什么问题

判断一个参数「是不是空的」时，`eq $v ""` 只挡住了真正长度为 0 的字符串。前置元数据里写成 `" "`、`"\n"` 的值一样没有内容，却会通过 `eq` 检查，最后在页面上留下一个空标题或空按钮。`strings.ContainsNonSpace` 问的是「里面有没有**任何**非空白字符」，正好用来判断「这个值到底有没有内容」。

## 什么时候用，什么时候别用

**该用**：

- 前置元数据、`site.Params` 里的可选文本字段，判断「有内容才渲染」；
- 想同时挡住空格、制表符、换行、以及 Unicode 空格分隔符（含不换行空格 U+00A0）。

**别用**：

- 只想判断字符串是否恰好为空串 → `{{ if eq $v "" }}` 更直接；
- 想把首尾空白删掉再判断 → 用 [`strings.TrimSpace`](/functions/strings/trimspace/)；
- 想数有效字符个数 → 用 [`strings.CountRunes`](/functions/strings/countrunes/)；
- 想判断「包含某个子串」→ 用 [`strings.Contains`](/functions/strings/contains/)。

## 用法

空白字符包括 `\t`、`\n`、`\v`、`\f`、`\r`，以及 [Unicode 空格分隔符（Unicode Space Separator）][] 类别中的字符。

```go-html-template
{{ strings.ContainsNonSpace "\n" }} → false
{{ strings.ContainsNonSpace " " }} → false
{{ strings.ContainsNonSpace "\n abc" }} → true
```

[Unicode 空格分隔符（Unicode Space Separator）]: https://www.compart.com/en/unicode/category/Zs

## 完整示例（实测）

```go-html-template {file="layouts/_partials/has-content.html"}
{{ $v := "\n  " }}
空白参数：{{ strings.ContainsNonSpace $v }}，有内容：{{ strings.ContainsNonSpace "有内容" }}
```

Hugo 0.167.0 实测输出：

```text
空白参数：false，有内容：true
```

**你应当看到什么**：`$v` 里只有换行和空格，所以是 `false`；换成真正的中文文本就是 `true`。注意这个判断看的是「有没有非空白字符」，不是「长度是否大于 0」。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，单语言站点（`locale = 'zh-CN'`），Windows。

| 输入 | 结果 | 是否报错 |
| --- | --- | --- |
| `""`（空字符串） | `false` | 否 |
| `" "`、`"\n"`、`"\t"` | `false` | 否 |
| `"\u00a0"`（不换行空格 U+00A0） | `false`——它属于 Unicode 空格分隔符 | 否 |
| `"\n abc"`、`"有内容"` | `true` | 否 |
| `42`（数字） | `true`——先转成字符串 `"42"`，其中都是非空白字符 | 否 |
| 返回类型 | `bool`，永远不会是 `nil` | 否 |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 没报错但结果不对 | 用 `eq $v ""` 判断后仍渲染出空标题 | `" "` 不等于 `""` | 改用本函数（实测 `" "` 返回 `false`） |
| 没报错但结果不对 | 明明只想判空，数字参数却返回 `true` | 非字符串参数会先转成字符串，`42` → `"42"` | 先确认字段类型，必要时用 `printf "%v"` 显式转换后再判断 |

更多排查入口见[故障排查](/troubleshooting/)。
