+++
title = "strings.FirstLower"
linkTitle = "FirstLower"
description = "返回给定字符串，并把第一个字符转为小写。"
date = 2026-10-02
weight = 110
source = "https://gohugo.io/functions/strings/firstlower/"

[params.functions_and_methods]
signatures = ["strings.FirstLower STRING"]
returnType = "string"
+++

## 这一页解决什么问题

要把一个标识符的首字母改小写，而其余部分原样保留：Go 风格的方法名 `GetPage` 想变成 JSON/JavaScript 里的 `getPage`，字符串 `HUGO` 想变成 `hUGO`。用 [`strings.ToLower`](/functions/strings/tolower/) 会把整串都压成小写，用 [`strings.Title`](/functions/strings/title/) 又会改动每个词，只有本函数只动第一个字符。

## 什么时候用，什么时候别用

**该用**：

- 只改首字符的大小写（驼峰标识符转小驼峰）；
- 想把首字母大写的写法统一成小写开头。

**别用**：

- 整串转小写 / 大写 → 用 [`strings.ToLower`](/functions/strings/tolower/)、[`strings.ToUpper`](/functions/strings/toupper/)；
- 想改成标题式大小写（每个实词首字母大写）→ 用 [`strings.Title`](/functions/strings/title/)；
- 只想改首字母**大写** → 用 [`strings.FirstUpper`](/functions/strings/firstupper/)；
- 想删掉开头的空白或字符 → 用 [`strings.TrimSpace`](/functions/strings/trimspace/)、[`strings.TrimLeft`](/functions/strings/trimleft/)。

## 用法

**（0.167.0 新增）**

```go-html-template
{{ strings.FirstLower "HUGO" }} → hUGO
```

## 完整示例（实测）

```go-html-template {file="layouts/_partials/method.html"}
{{ $method := "GetPage" }}
{{ strings.FirstLower $method }}
```

Hugo 0.167.0 实测输出：

```text
getPage
```

**你应当看到什么**：只有开头的 `G` 变成了 `g`，后面的 `etPage` 一个字母都没动——这正是「驼峰标识符转小驼峰」想要的结果。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，单语言站点（`locale = 'zh-CN'`），Windows。

| 输入 | 结果 | 是否报错 |
| --- | --- | --- |
| `"HUGO"` | `hUGO`——**只改第一个字符**，其余原样保留 | 否 |
| `"GetPage"` | `getPage` | 否 |
| `""`（空字符串） | `""`（原样返回，不会报错） | 否 |
| `"hugo"`（首字母已小写） | `hugo`（无变化） | 否 |
| 返回类型 | `string`，永远不是 `nil` | 否 |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 没报错但结果不对 | `HUGO` 想得到 `hugo`，却得到 `hUGO` | 本函数只改**第一个**字符，不是整串转小写 | 整串转小写用 [`strings.ToLower`](/functions/strings/tolower/) |
| 没报错但结果不对 | 首字符是数字或汉字时没有变化 | 只对可映射大小写的字符生效 | 这类字符串本就无需转换；先确认输入是什么 |

更多排查入口见[故障排查](/troubleshooting/)。
