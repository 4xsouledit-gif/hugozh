+++
title = "strings.Substr"
linkTitle = "Substr"
description = "返回给定字符串的子串，从起始位置开始，到给定长度之后结束。"
date = 2026-10-02
weight = 220
source = "https://gohugo.io/functions/strings/substr/"

[params.functions_and_methods]
signatures = ["strings.Substr STRING [START] [LENGTH]"]
returnType = "string"
aliases = ["substr"]
+++

起始位置从 0 开始计数，`0` 表示字符串的第一个字符。如果不指定 START，子串从位置 `0` 开始。START 为负数时，从字符串末尾开始提取字符。

如果不指定 LENGTH，子串包含从 START 位置到字符串末尾的所有字符。LENGTH 为负数时，将从字符串末尾略去相应数量的字符。

```go-html-template
{{ substr "abcdef" 0 }} → abcdef
{{ substr "abcdef" 1 }} → bcdef

{{ substr "abcdef" 0 1 }} → a
{{ substr "abcdef" 1 1 }} → b

{{ substr "abcdef" 0 -1 }} → abcde
{{ substr "abcdef" 1 -1 }} → bcde

{{ substr "abcdef" -1 }} → f
{{ substr "abcdef" -2 }} → ef

{{ substr "abcdef" -1 1 }} → f
{{ substr "abcdef" -2 1 }} → e

{{ substr "abcdef" -3 -1 }} → de
{{ substr "abcdef" -3 -2 }} → d
```
