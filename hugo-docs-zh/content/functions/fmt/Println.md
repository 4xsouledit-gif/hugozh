+++
title = "fmt.Println"
linkTitle = "fmt.Println"
description = "返回给定参数默认的字符串表示，并在末尾附加一个换行。"
date = 2026-10-02
weight = 60
source = "https://gohugo.io/functions/fmt/println/"

[params.functions_and_methods]
signatures = ["fmt.Println INPUT"]
returnType = "string"
aliases = ["println"]
+++

```go-html-template
{{ println "foo" }} → foo\n
{{ println "foo" "bar" }} → foo bar\n
```
