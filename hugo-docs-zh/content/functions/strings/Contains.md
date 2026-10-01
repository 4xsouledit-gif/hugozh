+++
title = "strings.Contains"
linkTitle = "Contains"
description = "报告给定字符串是否包含指定子串。"
date = 2026-10-02
weight = 30
source = "https://gohugo.io/functions/strings/contains/"

[params.functions_and_methods]
signatures = ["strings.Contains STRING SUBSTRING"]
returnType = "bool"
+++

```go-html-template
{{ strings.Contains "Hugo" "go" }} → true
```

该检查区分大小写：

```go-html-template
{{ strings.Contains "Hugo" "Go" }} → false
```
