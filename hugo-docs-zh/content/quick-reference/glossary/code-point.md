+++
title = "码点"
linkTitle = "码点"
description = "Unicode 标准为每个字符分配的唯一编号。"
date = 2026-10-02
weight = 210
source = "https://gohugo.io/quick-reference/glossary/code-point/"

[params.teach]
difficulty = "参考"
prereq = ["在文档里遇到不认识的 Hugo 术语时查阅"]
outcomes = ["分辨字符串函数数的是字节还是码点，避免截断中文或多字节字符时截出半个字"]
next = ["/functions/strings/"]
+++

## 码点

_码点_（code point）是 Unicode 标准为每个字符分配的唯一编号。例如拉丁大写字母 `A` 的码点是 `U+0041`，emoji 🎉 的码点是 `U+1F389`。

参见：[码点（维基百科）](https://en.wikipedia.org/wiki/Code_point)

## 为什么重要

按字节数还是按码点数，字符串函数的结论完全不同：`len` 数的是字节，`strings.RuneCount` 数的是码点，而 Go 里的 [rune](g) 就是码点的别名，一个汉字或 emoji 会占多个字节。用错计数方式，「截断 N 个字符」就可能截出半个字，做摘要或 URL slug 时尤其明显。拿不准时用 `strings.RuneCount` 实测一次。

延伸阅读：[字符串函数](/functions/strings/) · [URL 管理](/content-management/urls/)
