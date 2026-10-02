+++
title = "fmt.Print"
linkTitle = "fmt.Print"
description = "返回给定参数默认的字符串表示。"
date = 2026-10-02
weight = 40
source = "https://gohugo.io/functions/fmt/print/"

[params.functions_and_methods]
signatures = ["fmt.Print INPUT"]
returnType = "string"
aliases = ["print"]
+++

## 这一页解决什么问题

把若干值拼成一段文本，或者把一个结构（切片、映射、数字、布尔）转成可读的字符串。`print` 就是 Go `fmt.Print` 的模板版本：它按**默认格式**输出每个参数，参数之间**不加任何分隔**。调试模板时最常用它把值直接打到产物里看一眼。

## 什么时候用，什么时候别用

**该用**：

- 简单拼接，不需要格式控制；
- 调试：把一个类型不确定的值转成字符串看一眼。

**别用**：

- 需要小数位、补零、加引号等格式控制 → 用 [`fmt.Printf`](/functions/fmt/printf/)；
- 需要参数之间带空格、末尾带换行 → 用 [`fmt.Println`](/functions/fmt/println/)；
- 想输出模板片段当 HTML → 需要 [`safe.HTML`](/functions/safe/html/)，否则标签会被转义；
- 想写进构建日志（而不是产物）→ 用 [`fmt.Warnf`](/functions/fmt/warnf/) / [`fmt.Errorf`](/functions/fmt/errorf/)。

## 用法

```go-html-template
{{ print "foo" }} → foo
{{ print "foo" "bar" }} → foobar
{{ print (slice 1 2 3) }} → [1 2 3]
```

## 完整示例（实测）

```go-html-template {file="layouts/_partials/debug.html"}
[{{ print "foo" }}]|[{{ print "foo" "bar" }}]|[{{ print (slice 1 2 3) }}]|[{{ print nil }}]
```

Hugo 0.167.0 实测输出：

```text
[foo]|[foobar]|[[1 2 3]]|[<nil>]
```

**你应当看到什么**：两个字符串被**直接相连**成 `foobar`（没有空格）；切片输出成 `[1 2 3]`，所以外层方括号里套了内层方括号；`nil` 输出成 `<nil>`——这正是调试时想看到的信息。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，单语言站点（`locale = 'zh-CN'`），Windows。

| 输入 | 结果 | 是否报错 |
| --- | --- | --- |
| `"foo" "bar"` | `foobar`（**无**分隔符） | 否 |
| `(slice 1 2 3)` | `[1 2 3]` | 否 |
| `42` | `42` | 否 |
| `true` | `true` | 否 |
| `nil` | `<nil>` | 否 |
| 返回类型 | `string`，永远不是 `nil` | 否 |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 没报错但结果不对 | `print "a" "b"` 得到 `ab`，不是 `a b` | 本函数不在参数之间插空格 | 需要空格用 [`fmt.Println`](/functions/fmt/println/) 或自己写 `" "` |
| 没报错但结果不对 | 输出的 HTML 标签变成了可见文本 | 字符串按 HTML 规则转义 | 明确要当 HTML 用时套 [`safe.HTML`](/functions/safe/html/) |
| 没报错但结果不对 | 数字精度不对 | `print` 用默认格式，不接受精度控制 | 用 [`fmt.Printf`](/functions/fmt/printf/) 配 `%.2f` 之类 |

更多排查入口见[故障排查](/troubleshooting/)。
