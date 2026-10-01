+++
title = "fmt.Print"
linkTitle = "fmt.Print"
description = "返回给定参数默认的字符串表示。"
date = 2026-10-02
weight = 40
source = "https://gohugo.io/functions/fmt/print/"

[params.functions_and_methods]
signatures = ["fmt.Print INPUT"]
returnType = "string"
aliases = ["print"]
+++

```go-html-template
{{ print "foo" }} → foo
{{ print "foo" "bar" }} → foobar
{{ print (slice 1 2 3) }} → [1 2 3]
```
