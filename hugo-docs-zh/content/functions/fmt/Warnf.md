+++
title = "fmt.Warnf"
linkTitle = "fmt.Warnf"
description = "从模板记录一条 WARNING 日志。"
date = 2026-10-02
weight = 70
source = "https://gohugo.io/functions/fmt/warnf/"

[params.functions_and_methods]
signatures = ["fmt.Warnf FORMAT [INPUT]"]
returnType = "string"
aliases = ["warnf"]
+++

## 这一页解决什么问题

模板里发现问题，但又不想让整个站点构建失败：某个可选参数没配、某个字段已弃用、某个资源找不到但还能降级渲染。`warnf` 把这些信息写进构建日志（WARNING 级别），构建照常完成——这样读者看不到问题，作者能在终端里看到。

## 什么时候用，什么时候别用

**该用**：

- 可降级的问题（有默认值、有回退路径）；
- 主题/短代码提醒使用者「你少配了一个可选项」。

**别用**：

- 问题无法继续 → 用 [`fmt.Errorf`](/functions/fmt/errorf/)，让构建失败；
- 希望使用者能按 ID 关掉这条警告 → 用 [`fmt.Warnidf`](/functions/fmt/warnidf/)；
- 调试时想把值打到**产物**里 → 用 [`fmt.Print`](/functions/fmt/print/)。

## 用法

Go 的 [`fmt`][] 包的文档描述了格式字符串的结构与内容。

[`fmt`]: https://pkg.go.dev/fmt

`warnf` 函数对格式字符串求值，然后把结果输出到 WARNING 日志。Hugo 对每条唯一消息只输出一次，以免日志被重复警告淹没。

```go-html-template
{{ warnf "The %q shortcode was unable to find %s. See %s" .Name $file .Position }}
```

用 [`warnidf`][] 函数可以按需抑制特定的警告。

用 `warnf` 调试时，如果不想让重复消息被抑制，可以用 [`math.Counter`][] 函数让每条消息唯一。例如：

```go-html-template
{{ range site.RegularPages }}
  {{ .Section | warnf "%#[2]v [%[1]d]" math.Counter }}
{{ end }}
```

[`math.Counter`]: /functions/math/counter/
[`warnidf`]: /functions/fmt/warnidf/

## 完整示例（实测）

```go-html-template {file="layouts/_partials/optional-flag.html"}
{{ warnf "test warning %s" "x" }}ok
```

Hugo 0.167.0 实测：构建**成功**（退出码 0），控制台出现一行

```text
WARN  test warning x
```

页面产物是 `ok`（`warnf` 的返回值不会占位输出）。

**你应当看到什么**：`WARN` 后面有两个空格，然后是格式化后的消息。注意「只输出一次」的行为——下面这段模板重复调用三次：

```go-html-template
{{ range seq 3 }}{{ warnf "same message" }}{{ end }}ok
```

实测只输出**一行** `WARN  same message`，而不是三行。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，单语言站点（`locale = 'zh-CN'`），Windows。

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| 调用一次（实测） | 日志出现 `WARN  test warning x` | 否（退出码 0） |
| 同一消息调用 3 次（实测 `range seq 3`） | 日志**只有一行**同类警告 | 否 |
| 消息里的格式动词写错 | 输出 `%!...` 形式的文本（与 [`fmt.Printf`](/functions/fmt/printf/) 同源） | 否 |
| 返回类型 | `string`；直接放在模板里不会输出可见内容 | 否 |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 没报错但结果不对 | 循环里只看到一条警告，以为循环没跑 | Hugo 对**相同**消息只输出一次（实测 3 次只出 1 行） | 用 [`math.Counter`](/functions/math/counter/) 让每条消息唯一（上游示例即如此） |
| 没报错但结果不对 | 页面上出现 `%!s(...)` | 格式动词与参数类型不符 | 检查占位符与参数 | 
| 报错看不懂 | 构建被中止 | 用了 [`fmt.Errorf`](/functions/fmt/errorf/) 而不是 `warnf` | 只要警告就用本函数 |

更多排查入口见[故障排查](/troubleshooting/)。
