+++
title = "strings.TrimSpace"
linkTitle = "TrimSpace"
description = "返回给定字符串，并删除 Unicode 定义的首尾空白字符。"
date = 2026-10-02
weight = 300
source = "https://gohugo.io/functions/strings/trimspace/"

[params.functions_and_methods]
signatures = ["strings.TrimSpace STRING"]
returnType = "string"
+++

## 这一页解决什么问题

前置元数据、数据文件里的值经常带着看不见的首尾空白：`"  Hugo  "`、行末的换行。这类值直接拼进 `href`、`title` 或比较语句就会出问题。`strings.TrimSpace` 把首尾按 Unicode 定义属于空白的字符全部删掉，只留中间的内容。

## 什么时候用，什么时候别用

**该用**：

- 用户填写的参数、从外部文件读入的文本，进入比较或拼接之前先清理；
- 想同时处理空格、制表符、换行。

**别用**：

- 只想删掉特定的字符（引号、短横）→ 用 [`strings.Trim`](/functions/strings/trim/) 指定 cutset；
- 只想删一侧 → 用 [`strings.TrimLeft`](/functions/strings/trimleft/)、[`strings.TrimRight`](/functions/strings/trimright/)；
- 只想删掉结尾的一个换行 → 用 [`strings.Chomp`](/functions/strings/chomp/)（它不会碰空格）；
- 想判断「是不是空白」而不是修改 → 用 [`strings.ContainsNonSpace`](/functions/strings/containsnonspace/)。

## 用法

空白字符包括 `\t`、`\n`、`\v`、`\f`、`\r`，以及 [Unicode 空格分隔符（Unicode Space Separator）][] 类别中的字符。

```go-html-template
{{ strings.TrimSpace "\n\r\t   foo   \n\r\t" }} → foo
```

[Unicode 空格分隔符（Unicode Space Separator）]: https://www.compart.com/en/unicode/category/Zs

## 完整示例（实测）

```go-html-template {file="layouts/_partials/clean.html"}
[{{ strings.TrimSpace "  hugo  " }}]
```

Hugo 0.167.0 实测输出：

```text
[hugo]
```

**你应当看到什么**：方括号是我们自己加的，用来让首尾空白**看得见**——结果是 `[hugo]` 而不是 `[  hugo  ]`，说明两侧空格都被删掉了，中间内容原样保留。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，单语言站点（`locale = 'zh-CN'`），Windows。

| 输入 | 结果 | 是否报错 |
| --- | --- | --- |
| `"\n\r\t   foo   \n\r\t"` | `foo` | 否 |
| `"  hugo  "` | `hugo` | 否 |
| `""` | `""` | 否 |
| `"\u00a0x\u00a0"`（不换行空格 U+00A0） | `x`——它属于 Unicode 空格分隔符，会被删掉 | 否 |
| `42`（数字） | `"42"`，自动转成字符串 | 否 |
| 字符串中间的空白 | 不受影响，只删首尾 | 否 |
| 返回类型 | `string`，永远不是 `nil` | 否 |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 没报错但结果不对 | 模板里明明写了空格却还在 | 空白的来源在**字符串中间**，本函数只管首尾 | 中间空白用 [`strings.ReplaceRE`](/functions/strings/replacere/) 处理 |
| 没报错但结果不对 | 参数比较仍然不相等 | 只清理了一边 | 两边都过一遍 `TrimSpace` 再比较 |
| 没报错但结果不对 | 以为删的是引号/短横之类 | 本函数只认「空白字符」 | 删特定字符用 [`strings.Trim`](/functions/strings/trim/) |

更多排查入口见[故障排查](/troubleshooting/)。
