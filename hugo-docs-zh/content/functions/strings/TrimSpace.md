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

空白字符包括 `\t`、`\n`、`\v`、`\f`、`\r`，以及 [Unicode 空格分隔符（Unicode Space Separator）][] 类别中的字符。

```go-html-template
{{ strings.TrimSpace "\n\r\t   foo   \n\r\t" }} → foo
```

[Unicode 空格分隔符（Unicode Space Separator）]: https://www.compart.com/en/unicode/category/Zs
