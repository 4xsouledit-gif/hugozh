+++
title = "strings.SliceString"
linkTitle = "SliceString"
description = "返回给定字符串的子串，从起始位置开始，到结束位置之前结束。"
date = 2026-10-02
weight = 200
source = "https://gohugo.io/functions/strings/slicestring/"

[params.functions_and_methods]
signatures = ["strings.SliceString STRING [START] [END]"]
returnType = "string"
aliases = ["slicestr"]
+++

START 与 END 位置从 0 开始计数，`0` 表示字符串的第一个字符。如果不指定 START，子串从位置 `0` 开始；如果不指定 END，子串在最后一个字符之后结束。

```go-html-template
{{ slicestr "BatMan" }} → BatMan
{{ slicestr "BatMan" 3 }} → Man
{{ slicestr "BatMan" 0 3 }} → Bat
```

START 与 END 参数表示一个半开区间（half-open interval）的两个端点，这个概念初次接触时可能不太好理解。你可能会觉得 [`strings.Substr`][] 函数更容易掌握。

[`strings.Substr`]: /functions/strings/substr/
