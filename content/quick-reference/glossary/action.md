+++
title = "动作"
linkTitle = "动作"
description = "「动作」即模板动作（template action）。"
date = 2026-10-02
weight = 20
source = "https://gohugo.io/quick-reference/glossary/action/"

[params.teach]
difficulty = "参考"
prereq = ["在文档里遇到不认识的 Hugo 术语时查阅"]
outcomes = ["认出模板里哪些片段是动作，并知道模板报错时该去检查哪一行的动作边界"]
next = ["/templates/introduction/"]
+++

## 动作

参见 [template action](g)（模板动作）。

## 为什么重要

模板里用 `{{ }}` 或 `{{- -}}` 包起来、交给 Go 模板引擎执行的片段就是动作，输出的 HTML 里不会留下它们。把动作写成普通文本（例如漏掉一半花括号），页面会少一块内容或直接报模板解析错误；反过来，本该输出字面量的地方写成动作，会报找不到字段或函数。看到 `unexpected "}" in operand` 一类报错时，先检查出错那一行的动作边界。

延伸阅读：[模板介绍](/templates/introduction/) · [Go 模板函数](/functions/go-template/)
