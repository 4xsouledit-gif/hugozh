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
