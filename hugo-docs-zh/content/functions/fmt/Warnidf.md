+++
title = "fmt.Warnidf"
linkTitle = "fmt.Warnidf"
description = "从模板记录一条可抑制的 WARNING 日志。"
date = 2026-10-02
weight = 80
source = "https://gohugo.io/functions/fmt/warnidf/"

[params.functions_and_methods]
signatures = ["fmt.Warnidf ID FORMAT [INPUT]"]
returnType = "string"
aliases = ["warnidf"]
+++

Go 的 [`fmt`][] 包的文档描述了格式字符串的结构与内容。

[`fmt`]: https://pkg.go.dev/fmt

`warnidf` 函数对格式字符串求值，然后把结果输出到 WARNING 日志。与 [`warnf`][] 函数不同，你可以把消息 ID 加入项目配置的 `ignoreLogs` 数组，从而抑制 `warnidf` 函数记录的警告。

这段模板代码：

```go-html-template
{{ warnidf "warning-42" "You should consider fixing this." }}
```

产生如下控制台日志：

```text
WARN You should consider fixing this.
You can suppress this warning by adding the following to your project configuration:
ignoreLogs = ['warning-42']
```

要抑制这条消息：

```toml
ignoreLogs = ["warning-42"]
```

[`warnf`]: /functions/fmt/warnf/
