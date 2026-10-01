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
