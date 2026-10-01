+++
title = "strings.Chomp"
linkTitle = "Chomp"
description = "返回给定字符串，并删除末尾的所有换行符与回车符。"
date = 2026-10-02
weight = 20
source = "https://gohugo.io/functions/strings/chomp/"

[params.functions_and_methods]
signatures = ["strings.Chomp STRING"]
returnType = "any"
aliases = ["chomp"]
+++

如果参数的类型是 `template.HTML`，则返回 `template.HTML`；否则返回 `string`。

```go-html-template
{{ chomp "foo\n" }} → foo
{{ chomp "foo\n\n" }} → foo

{{ chomp "foo\r\n" }} → foo
{{ chomp "foo\r\n\r\n" }} → foo
```
