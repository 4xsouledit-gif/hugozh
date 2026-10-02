+++
title = "strings.FirstUpper"
linkTitle = "FirstUpper"
description = "返回给定字符串，并把第一个字符转为大写。"
date = 2026-10-02
weight = 120
source = "https://gohugo.io/functions/strings/firstupper/"

[params.functions_and_methods]
signatures = ["strings.FirstUpper STRING"]
returnType = "string"
+++

## 这一页解决什么问题

要把一个小写开头的名字、section 名或标签显示成首字母大写，其余部分原样保留：`blog` → `Blog`、`hugo` → `Hugo`。用 [`strings.Title`](/functions/strings/title/) 会按英文标题规则改动每个词（例如把 `a` 这类虚词的处理规则也套上），只改首字母时用本函数最稳。

## 什么时候用，什么时候别用

**该用**：

- 列表标签、分类名、用户名等「首字母大写即可」的展示位；
- 想保留字符串内部原有的大小写。

**别用**：

- 整串转大写 / 小写 → 用 [`strings.ToUpper`](/functions/strings/toupper/)、[`strings.ToLower`](/functions/strings/tolower/)；
- 想按英文标题规则处理每个词 → 用 [`strings.Title`](/functions/strings/title/)；
- 只想改首字母**小写** → 用 [`strings.FirstLower`](/functions/strings/firstlower/)；
- 输入可能带首尾空白 → 先用 [`strings.TrimSpace`](/functions/strings/trimspace/) 清理，否则「空白」会被当成第一个字符。

## 用法

```go-html-template
{{ strings.FirstUpper "hugo" }} → Hugo
```

## 完整示例（实测）

```go-html-template {file="layouts/_partials/section-label.html"}
{{ $section := "blog" }}
{{ strings.FirstUpper $section }}
```

Hugo 0.167.0 实测输出：

```text
Blog
```

**你应当看到什么**：只有开头的 `b` 变成了 `B`。如果传进去的本来就是大写开头（例如 `"HUGO"`），结果与输入相同——它不会把其余字母改成小写。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，单语言站点（`locale = 'zh-CN'`），Windows。

| 输入 | 结果 | 是否报错 |
| --- | --- | --- |
| `"hugo"` | `Hugo` | 否 |
| `"HUGO"` | `HUGO`——只处理第一个字符，其余保持不变 | 否 |
| `""`（空字符串） | `""`（原样返回，不会报错） | 否 |
| 返回类型 | `string`，永远不是 `nil` | 否 |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 没报错但结果不对 | `"HUGO"` 想得到 `"Hugo"`，结果还是 `"HUGO"` | 本函数只改**第一个**字符，不会把后面的字母转小写 | 先 [`strings.ToLower`](/functions/strings/tolower/) 再 [`strings.FirstUpper`](/functions/strings/firstupper/) |
| 没报错但结果不对 | 结果前面多出一个空格 | 输入本身以空白开头，空白就是「第一个字符」 | 先 [`strings.TrimSpace`](/functions/strings/trimspace/) |

更多排查入口见[故障排查](/troubleshooting/)。
