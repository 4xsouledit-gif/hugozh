+++
title = "rune"
linkTitle = "rune"
description = "把单个字符表示为一个数值的方式。"
date = 2026-10-02
weight = 1180
source = "https://gohugo.io/quick-reference/glossary/rune/"
+++

rune 是一种把单个字符表示为数值的方式。在 Hugo 和 Go 中，文本以字节序列存储。然而，像 `x` 这样的基本字母只占一个字节，而 `ü` 这样的单个字符却由多个字节组成。无论存储一个字符需要多少字节，rune 都把整个字符表示为一个值。

严格来说，rune 只是 32 位 [integer](g) 的另一个名称。它存储 Unicode [code point](g)，也就是分配给该特定字符的官方编号。

当你希望按字符而不是按原始数据大小来操作文本时，就是在使用 rune。在 [template](g) 中使用 [rune literal](g) 书写 rune，例如 `'x'`、`'\n'` 或 `'ü'`。
