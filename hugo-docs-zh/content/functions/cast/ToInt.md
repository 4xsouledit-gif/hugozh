+++
title = "cast.ToInt"
linkTitle = "cast.ToInt"
description = "返回给定值转换后的十进制整数（base 10）。"
date = 2026-10-02
weight = 30
source = "https://gohugo.io/functions/cast/toint/"

[params.functions_and_methods]
signatures = ["cast.ToInt INPUT"]
returnType = "int"
aliases = ["int"]
+++

输入为十进制（base 10）时：

```go-html-template
{{ int 11 }} → 11 (int)
{{ int "11" }} → 11 (int)

{{ int 11.1 }} → 11 (int)
{{ int 11.9 }} → 11 (int)
```

输入为二进制（base 2）时：

```go-html-template
{{ int 0b11 }} → 3 (int)
{{ int "0b11" }} → 3 (int)
```

输入为八进制（base 8）时（两种记法都可用）：

```go-html-template
{{ int 011 }} → 9 (int)
{{ int "011" }} → 9 (int)

{{ int 0o11 }} → 9 (int)
{{ int "0o11" }} → 9 (int)
```

输入为十六进制（base 16）时：

```go-html-template
{{ int 0x11 }} → 17 (int)
{{ int "0x11" }} → 17 (int)
```

> [!NOTE]
> 带前导零的值是八进制（base 8）。转换十进制（base 10）数字的字符串表示时，请先去掉前导零：

`{{ strings.TrimLeft "0" "0011" | int }} → 11`
