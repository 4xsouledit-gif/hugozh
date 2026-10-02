+++
title = "正则表达式（regular expression）"
linkTitle = "正则表达式"
description = "定义搜索模式的字符序列。"
date = 2026-10-02
weight = 1080
source = "https://gohugo.io/quick-reference/glossary/regular-expression/"

[params.teach]
difficulty = "参考"
prereq = ["在文档里遇到不认识的 Hugo 术语时查阅"]
outcomes = ["写出模板里可用的正则，并在报错时判断是不是用了 Go 不支持的高级语法"]
next = ["/functions/strings/findre/"]
+++

正则表达式（regular expression，又称 regex）是定义搜索模式的字符序列。在模板或项目配置中定义正则表达式时，请使用 [RE2 语法](https://github.com/google/re2/wiki/syntax)。

## 为什么重要

模板里所有带 `RE` 的函数（`strings.FindRE`、`strings.ReplaceRE`、`strings.FindRESubmatch` 等）都用 Go 的 RE2 引擎，它**不支持**后向引用和前后瞻，写成 `(?<=...)` 会直接报 `invalid or unsupported Perl syntax` 一类的错误。
另一个容易忽略的点是匹配范围：`FindRE` 只返回匹配到的片段，是否区分大小写、是否跨行都取决于你在模式里写的标志；排查时先把模式单独放进一个最小模板里跑，比在完整页面里猜快。

延伸阅读：[strings.FindRE](/functions/strings/findre/) · [strings.ReplaceRE](/functions/strings/replacere/)
