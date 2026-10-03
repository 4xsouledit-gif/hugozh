+++
title = "fmt.Errorf"
linkTitle = "fmt.Errorf"
description = "从模板记录一条 ERROR 日志。"
date = 2026-10-02
weight = 20
source = "https://gohugo.io/functions/fmt/errorf/"

[params.functions_and_methods]
signatures = ["fmt.Errorf FORMAT [INPUT]"]
returnType = "string"
aliases = ["errorf"]
+++

## 这一页解决什么问题

模板遇到「继续下去没有意义」的情况时，最糟的做法是静默渲染出错误内容。`errorf` 让你主动把原因写清楚，并**让整个构建失败**——缺少必需参数、配置写错、短代码用错位置，都应该在构建期而不是上线后被发现。

## 什么时候用，什么时候别用

**该用**：

- 短代码、局部模板里检测到必需参数缺失；
- 配置组合非法，希望立刻阻止发布。

**别用**：

- 只想提醒、不阻止构建 → 用 [`fmt.Warnf`](/functions/fmt/warnf/)；
- 希望使用者能按 ID 抑制这条消息 → 用 [`fmt.Erroridf`](/functions/fmt/erroridf/)；
- 只是想把值打到产物里调试 → 用 [`fmt.Print`](/functions/fmt/print/)。

## 用法

Go 的 [`fmt`][] 包的文档描述了格式字符串的结构与内容。

[`fmt`]: https://pkg.go.dev/fmt

`errorf` 函数对格式字符串求值，然后把结果输出到 ERROR 日志并使构建失败。

```go-html-template
{{ errorf "The %q shortcode requires a src argument. See %s" .Name .Position }}
```

用 [`erroridf`][] 函数可以按需抑制特定的错误。

[`erroridf`]: /functions/fmt/erroridf/

## 完整示例（实测）

```go-html-template {file="layouts/_partials/require-src.html"}
{{ errorf "The %q shortcode requires a src argument." "img" }}
```

Hugo 0.167.0 实测：构建**失败**（退出码 1），控制台输出：

```text
ERROR The "img" shortcode requires a src argument.
ERROR error building site: logged 1 error(s)
```

**你应当看到什么**：`%q` 把 `img` 包成了带引号的 `"img"`，随后 Hugo 追加一行 `logged 1 error(s)` 并中止构建。写错误提示时把「哪里错了、需要什么」写进去，比只写一句「参数错误」有用得多。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，单语言站点（`locale = 'zh-CN'`），Windows。

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| 被执行到（实测上面的模板） | 控制台输出 `ERROR The "img" shortcode requires a src argument.`，随后 `ERROR error building site: logged 1 error(s)` | **是，构建失败**（退出码 1） |
| 写在不会执行的分支里（实测 `{{ if false }}{{ errorf "never runs" }}{{ end }}`） | 什么都不输出，构建成功 | 否 |
| 消息里的格式动词写错 | 与 [`fmt.Printf`](/functions/fmt/printf/) 一样，输出 `%!...` 形式的文本（不额外报错） | 否 |
| 返回类型 | 签名是 `string`，但正常情况下构建已经中止，不会有可用返回值 | —— |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 报错看不懂 | 构建失败但不知道哪个页面 | 消息里没带上下文 | 用 `%q` 带上名称、用 `%s` 带上 `.Position`（上游示例即如此） |
| 没报错但结果不对 | 加了 `errorf` 却什么都没发生 | 代码路径没被执行（实测放在 `if false` 里不触发） | 确认条件确实成立；排查时可临时改成 [`fmt.Warnf`](/functions/fmt/warnf/) |
| 报错看不懂 | 想让使用者能关掉这条错误 | `errorf` 不支持抑制 | 改用 [`fmt.Erroridf`](/functions/fmt/erroridf/) 配 `ignoreLogs` |

更多排查入口见[故障排查](/troubleshooting/)。
