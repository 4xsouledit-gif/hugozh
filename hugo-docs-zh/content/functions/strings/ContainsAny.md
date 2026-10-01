+++
title = "strings.ContainsAny"
linkTitle = "ContainsAny"
description = "报告给定字符串是否包含指定字符集合中的任意字符。"
date = 2026-10-02
weight = 40
source = "https://gohugo.io/functions/strings/containsany/"

[params.functions_and_methods]
signatures = ["strings.ContainsAny STRING SET"]
returnType = "bool"
+++

```go-html-template
{{ strings.ContainsAny "Hugo" "gm" }} → true
```

该检查区分大小写：

```go-html-template
{{ strings.ContainsAny "Hugo" "Gm" }} → false
```
