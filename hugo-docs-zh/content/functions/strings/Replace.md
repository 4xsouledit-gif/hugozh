+++
title = "strings.Replace"
linkTitle = "Replace"
description = "返回给定字符串，并把其中所有 OLD 替换为 NEW。"
date = 2026-10-02
weight = 160
source = "https://gohugo.io/functions/strings/replace/"

[params.functions_and_methods]
signatures = ["strings.Replace STRING OLD NEW [LIMIT]"]
returnType = "string"
aliases = ["replace"]
+++

```go-html-template
{{ $s := "Batman and Robin" }}
{{ replace $s "Robin" "Catwoman" }} → Batman and Catwoman
```

用 `LIMIT` 参数限制替换次数：

```go-html-template
{{ replace "aabbaabb" "a" "z" 2 }} → zzbbaabb
```
