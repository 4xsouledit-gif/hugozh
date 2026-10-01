+++
title = "cast.ToString"
linkTitle = "cast.ToString"
description = "返回给定值转换后的字符串。"
date = 2026-10-02
weight = 40
source = "https://gohugo.io/functions/cast/tostring/"

[params.functions_and_methods]
signatures = ["cast.ToString INPUT"]
returnType = "string"
aliases = ["string"]
+++

输入为十进制（base 10）时：

```go-html-template
{{ string 11 }} → 11 (string)
{{ string "11" }} → 11 (string)

{{ string 11.1 }} → 11.1 (string)
{{ string "11.1" }} → 11.1 (string)

{{ string 11.9 }} → 11.9 (string)
{{ string "11.9" }} → 11.9 (string)
```

输入为二进制（base 2）时：

```go-html-template
{{ string 0b11 }} → 3 (string)
{{ string "0b11" }} → 0b11 (string)
```

输入为八进制（base 8）时（两种记法都可用）：

```go-html-template
{{ string 011 }} → 9 (string)
{{ string "011" }} → 011 (string)

{{ string 0o11 }} → 9 (string)
{{ string "0o11" }} → 0o11 (string)
```

输入为十六进制（base 16）时：

```go-html-template
{{ string 0x11 }} → 17 (string)
{{ string "0x11" }} → 0x11 (string)
```
