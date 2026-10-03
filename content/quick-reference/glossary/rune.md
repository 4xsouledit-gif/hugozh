+++
title = "rune"
linkTitle = "rune"
description = "把单个字符表示为一个数值的方式。"
date = 2026-10-02
weight = 1180
source = "https://gohugo.io/quick-reference/glossary/rune/"

[params.teach]
difficulty = "参考"
prereq = ["在文档里遇到不认识的 Hugo 术语时查阅"]
outcomes = ["能判断一处文本处理该按 rune（字符）还是按字节计算，并知道混淆后的典型症状"]
next = ["/functions/strings/countrunes/"]
+++

rune 是一种把单个字符表示为数值的方式。在 Hugo 和 Go 中，文本以字节序列存储。然而，像 `x` 这样的基本字母只占一个字节，而 `ü` 这样的单个字符却由多个字节组成。无论存储一个字符需要多少字节，rune 都把整个字符表示为一个值。

严格来说，rune 只是 32 位 [integer](g) 的另一个名称。它存储 Unicode [code point](g)，也就是分配给该特定字符的官方编号。

当你希望按字符而不是按原始数据大小来操作文本时，就是在使用 rune。在 [template](g) 中使用 [rune literal](g) 书写 rune，例如 `'x'`、`'\n'` 或 `'ü'`。

## 为什么重要

中文文本里一个汉字占 3 个字节，用 `len` 或按字节截断会把汉字切碎，输出乱码或问号；改用按字符计算的 `countrunes` 才能得到正确字数。看到「中文被截成半个字」「字数统计明显偏大」，多半就是把 rune 当成了字节。

延伸阅读：[countrunes](/functions/strings/countrunes/)、[字符串函数](/functions/strings/)
