+++
title = "debug.VisualizeSpaces"
linkTitle = "debug.VisualizeSpaces"
description = "返回给定字符串，其中的空格被替换为可见的字符串。"
date = 2026-10-02
weight = 40
source = "https://gohugo.io/functions/debug/visualizespaces/"

[params.functions_and_methods]
signatures = ["debug.VisualizeSpaces STRING"]
returnType = "string"
+++

```go-html-template
{{ debug.VisualizeSpaces "foo  bar" }} → foo[SPACE][SPACE]bar
```
