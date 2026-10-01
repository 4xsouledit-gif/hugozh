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

Go 的 [`fmt`][] 包的文档描述了格式字符串的结构与内容。

[`fmt`]: https://pkg.go.dev/fmt

`errorf` 函数对格式字符串求值，然后把结果输出到 ERROR 日志并使构建失败。

```go-html-template
{{ errorf "The %q shortcode requires a src argument. See %s" .Name .Position }}
```

用 [`erroridf`][] 函数可以按需抑制特定的错误。

[`erroridf`]: /functions/fmt/erroridf/
