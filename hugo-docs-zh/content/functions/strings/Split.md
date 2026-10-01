+++
title = "strings.Split"
linkTitle = "Split"
description = "按分隔符切分给定字符串，返回字符串切片。"
date = 2026-10-02
weight = 210
source = "https://gohugo.io/functions/strings/split/"

[params.functions_and_methods]
signatures = ["strings.Split STRING DELIM"]
returnType = "[]string"
aliases = ["split"]
+++

示例：

```go-html-template
{{ split "tag1,tag2,tag3" "," }} → ["tag1", "tag2", "tag3"]
{{ split "abc" "" }} → ["a", "b", "c"]
```

> [!NOTE]
> `strings.Split` 函数的作用本质上与 [`collections.Delimit`][] 函数相反：`split` 把字符串切分成切片，`delimit` 则把切片拼接成字符串。

[`collections.Delimit`]: /functions/collections/delimit/
