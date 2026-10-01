+++
title = "cast.ToFloat"
linkTitle = "cast.ToFloat"
description = "返回给定值转换后的十进制浮点数（base 10）。"
date = 2026-10-02
weight = 20
source = "https://gohugo.io/functions/cast/tofloat/"

[params.functions_and_methods]
signatures = ["cast.ToFloat INPUT"]
returnType = "float64"
aliases = ["float"]
+++

输入为十进制（base 10）时：

```go-html-template
{{ float 11 }} → 11 (float64)
{{ float "11" }} → 11 (float64)

{{ float 11.1 }} → 11.1 (float64)
{{ float "11.1" }} → 11.1 (float64)

{{ float 11.9 }} → 11.9 (float64)
{{ float "11.9" }} → 11.9 (float64)
```

输入为二进制（base 2）时：

```go-html-template
{{ float 0b11 }} → 3 (float64)
```

输入为八进制（base 8）时（两种记法都可用）：

```go-html-template
{{ float 011 }} → 9 (float64)
{{ float "011" }} → 11 (float64)

{{ float 0o11 }} → 9 (float64)
```

输入为十六进制（base 16）时：

```go-html-template
{{ float 0x11 }} → 17 (float64)
```
