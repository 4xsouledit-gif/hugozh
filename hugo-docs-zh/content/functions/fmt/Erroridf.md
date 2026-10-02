+++
title = "fmt.Erroridf"
linkTitle = "fmt.Erroridf"
description = "从模板记录一条可抑制的 ERROR 日志。"
date = 2026-10-02
weight = 30
source = "https://gohugo.io/functions/fmt/erroridf/"

[params.functions_and_methods]
signatures = ["fmt.Erroridf ID FORMAT [INPUT]"]
returnType = "string"
aliases = ["erroridf"]
+++

## 这一页解决什么问题

有些错误对**一部分**使用者是致命的，对另一部分人是可接受的：某个可选字段没配、某个实验性特性没启用。用 [`fmt.Errorf`](/functions/fmt/errorf/) 会一刀切地让所有人构建失败；`erroridf` 给这条错误一个 **ID**，需要忽略它的人在配置里写一行 `ignoreLogs` 就能继续构建。

## 什么时候用，什么时候别用

**该用**：

- 错误有明确的「使用者可以选择忽略」的语义；
- 希望错误信息里自带抑制方法（Hugo 会自动追加提示）。

**别用**：

- 任何情况下都不该继续的硬错误 → 用 [`fmt.Errorf`](/functions/fmt/errorf/)，不要给出绕过口子；
- 只是想提醒 → 用 [`fmt.Warnf`](/functions/fmt/warnf/)、[`fmt.Warnidf`](/functions/fmt/warnidf/)。

## 用法

Go 的 [`fmt`][] 包的文档描述了格式字符串的结构与内容。

[`fmt`]: https://pkg.go.dev/fmt

`erroridf` 函数对格式字符串求值，然后把结果输出到 ERROR 日志并使构建失败。与 [`errorf`][] 函数不同，你可以把消息 ID 加入项目配置的 `ignoreLogs` 数组，从而抑制 `erroridf` 函数记录的错误。

这段模板代码：

```go-html-template
{{ erroridf "error-42" "You should consider fixing this." }}
```

产生如下控制台日志：

```text
ERROR You should consider fixing this.
You can suppress this error by adding the following to your project configuration:
ignoreLogs = ['error-42']
```

要抑制这条消息：

```toml
ignoreLogs = ["error-42"]
```

[`errorf`]: /functions/fmt/errorf/

## 完整示例（实测）

```go-html-template {file="layouts/_partials/check.html"}
{{ erroridf "error-42" "You should consider fixing this." }}
```

Hugo 0.167.0 实测：构建**失败**（退出码 1），控制台输出：

```text
ERROR You should consider fixing this.
You can suppress this error by adding the following to your project configuration:
ignoreLogs = ['error-42']
ERROR error building site: logged 1 error(s)
```

在 `hugo.toml` 里加上 `ignoreLogs = ['error-42']` 后，实测同一段模板**构建成功**（退出码 0），控制台不再出现任何 ERROR 行。

**你应当看到什么**：Hugo 会自动附带「怎么抑制」的说明，无需自己写进消息里；抑制之后连 `logged 1 error(s)` 那一行也消失了。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，单语言站点（`locale = 'zh-CN'`），Windows。

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| 未配置 `ignoreLogs`（实测） | 输出 ERROR + 抑制提示 + `logged 1 error(s)` | **是，构建失败**（退出码 1） |
| 配置 `ignoreLogs = ['error-42']`（实测） | 无 ERROR 输出 | 否（退出码 0） |
| ID 与 `ignoreLogs` 里的字符串不一致 | 不抑制，仍失败 | 是，构建失败 |
| 返回类型 | 签名是 `string`；未抑制时构建中止，不会有可用返回值 | —— |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 报错看不懂 | 加了 `ignoreLogs` 仍然失败 | ID 与配置里的字符串不一致（大小写、连字符都算） | 直接照抄控制台给出的 `ignoreLogs = ['…']` 那一行 |
| 报错看不懂 | 想让所有人都必须处理这条错误 | `erroridf` 天生可被抑制 | 硬错误改用 [`fmt.Errorf`](/functions/fmt/errorf/) |
| 报错看不懂 | 错误消息里出现 `%!` 片段 | 格式动词与参数类型不符（与 [`fmt.Printf`](/functions/fmt/printf/) 同源） | 检查 `%s`/`%q`/`%d` 与参数类型 |

更多排查入口见[故障排查](/troubleshooting/)。
