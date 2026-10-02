+++
title = "fmt.Printf"
linkTitle = "fmt.Printf"
description = "返回按给定格式说明符格式化后的字符串。"
date = 2026-10-02
weight = 50
source = "https://gohugo.io/functions/fmt/printf/"

[params.functions_and_methods]
signatures = ["fmt.Printf FORMAT [INPUT]"]
returnType = "string"
aliases = ["printf"]
+++

## 这一页解决什么问题

需要**控制格式**的字符串拼接：保留两位小数、给数字补零、加引号、显示百分号、按固定宽度对齐。`printf` 用 Go 的格式动词（`%s`、`%d`、`%.2f`、`%q`、`%v`…）拼出结果，并把结果作为字符串返回。

## 什么时候用，什么时候别用

**该用**：

- 数字格式化（价格、进度、尺寸）；
- 拼出需要引号/转义的 HTML 属性值（配 [`safe.HTMLAttr`](/functions/safe/htmlattr/)）；
- 需要 `%v` 这种「什么类型都能打印」的通用占位符。

**别用**：

- 只是简单拼接 → 用 [`fmt.Print`](/functions/fmt/print/)；
- 需要参数之间空格与换行 → 用 [`fmt.Println`](/functions/fmt/println/)；
- 想对数字做**本地化**（千分位、货币符号）→ 用 [`lang.FormatNumber`](/functions/lang/formatnumber/) 等语言函数：`printf` 不认识地区规则。

## 用法

Go 的 [`fmt`][] 包的文档描述了格式字符串的结构与内容。

[`fmt`]: https://pkg.go.dev/fmt

```go-html-template
{{ $var := "world" }}
{{ printf "Hello %s." $var }} → Hello world.
```

```go-html-template
{{ $pi := 3.14159265 }}
{{ printf "Pi is approximately %.2f." $pi }} → 3.14
```

把 `printf` 函数与 [`safe.HTMLAttr`][] 函数一起使用：

```go-html-template
{{ $desc := "Eat at Joe's" }}
<meta name="description" {{ printf "content=%q" $desc | safeHTMLAttr }}>
```

Hugo 会把它渲染为：

```html
<meta name="description" content="Eat at Joe's">
```

[`safe.HTMLAttr`]: /functions/safe/htmlattr/

## 完整示例（实测）

```go-html-template {file="layouts/_partials/format.html"}
[{{ printf "Hello %s." "world" }}]|[{{ printf "%.2f" 3.14159265 }}]|[{{ printf "%v" (slice 1 2) }}]
```

Hugo 0.167.0 实测输出：

```text
[Hello world.]|[3.14]|[1 2]
```

**你应当看到什么**：`%.2f` 把 `3.14159265` 四舍五入成 `3.14`（注意不是截断）；`%v` 输出切片的默认表示 `[1 2]`。格式动词的完整清单在 Go 的 [`fmt` 包文档](https://pkg.go.dev/fmt)里。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，单语言站点（`locale = 'zh-CN'`），Windows。

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| `%s` 配字符串 | `Hello world.` | 否 |
| `%.2f` 配浮点数 | `3.14` | 否 |
| `%d` 配整数 | `42` | 否 |
| `%v` 配切片 | `[1 2]` | 否 |
| **格式动词与参数类型不符**（实测 `printf "%d" "abc"`） | `%!d(string=abc)`——Go 把错误信息**当作返回值**输出，**构建不失败** | 否 |
| 返回类型 | `string` | 否 |

> [!WARNING]
> 格式动词写错**不会**让构建失败，只会在页面上留下一段 `%!d(string=abc)` 这样的文本。在页面上看到 `%!` 开头的内容，就是格式串与参数类型不匹配。

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 没报错但结果不对 | 页面出现 `%!d(string=abc)` | 格式动词与参数类型不符（实测不报错） | 检查参数类型：字符串用 `%s`/`%q`，整数用 `%d`，浮点用 `%f` |
| 没报错但结果不对 | 拼进 HTML 属性后页面结构坏了 | `printf` 只返回字符串，不负责属性安全 | 属性值用 [`safe.HTMLAttr`](/functions/safe/htmlattr/)（上游示例即如此） |
| 没报错但结果不对 | 希望是 `1,234.50` 却得到 `1234.5` | `printf` 不做本地化分组 | 用 [`lang.FormatNumber`](/functions/lang/formatnumber/) 等语言函数 |
| 没报错但结果不对 | 小数被截断而不是四舍五入 | 记错了舍入规则 | `%.Nf` 是四舍五入；需要截断请自己处理 |

更多排查入口见[故障排查](/troubleshooting/)。
