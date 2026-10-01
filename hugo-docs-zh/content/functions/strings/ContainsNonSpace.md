+++
title = "strings.ContainsNonSpace"
linkTitle = "ContainsNonSpace"
description = "报告给定字符串是否包含 Unicode 定义的非空白字符。"
date = 2026-10-02
weight = 50
source = "https://gohugo.io/functions/strings/containsnonspace/"

[params.functions_and_methods]
signatures = ["strings.ContainsNonSpace STRING"]
returnType = "bool"
+++

空白字符包括 `\t`、`\n`、`\v`、`\f`、`\r`，以及 [Unicode 空格分隔符（Unicode Space Separator）][] 类别中的字符。

```go-html-template
{{ strings.ContainsNonSpace "\n" }} → false
{{ strings.ContainsNonSpace " " }} → false
{{ strings.ContainsNonSpace "\n abc" }} → true
```

[Unicode 空格分隔符（Unicode Space Separator）]: https://www.compart.com/en/unicode/category/Zs
