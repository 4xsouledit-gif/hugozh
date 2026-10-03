+++
title = "模板动作（template action）"
linkTitle = "模板动作"
description = "模板中以成对花括号界定的数据求值或控制结构。"
date = 2026-10-02
weight = 1380
source = "https://gohugo.io/quick-reference/glossary/template-action/"

[params.teach]
difficulty = "参考"
prereq = ["在文档里遇到不认识的 Hugo 术语时查阅"]
outcomes = [
  "看懂「动作未闭合」一类模板报错，并定位到缺失的 `{{ end }}`",
]
next = ["/templates/introduction/"]
+++

_模板动作_（template action）是 [_template_](g) 中的求值或控制结构，以 `{{`&nbsp;和&nbsp;`}}` 界定。

参见：[Go 模板：动作（英文）](https://pkg.go.dev/text/template#hdr-Actions)

## 为什么重要

模板动作是模板里真正干活的部分：取值、判断、循环、赋值都写在 `{{` 与 `}}` 之间。写坏它的后果不是页面难看，而是整个构建失败——漏掉 `{{ end }}`、`if` 与 `end` 不配对时，Hugo 会报模板解析错误，且错误位置常常指向文件开头而不是出错的那几行。看到这类报错时，先数一数同一段里的 `{{ if }}`／`{{ range }}` 与 `{{ end }}` 是否配平。

延伸阅读：[模板入门](/templates/introduction/)、[检查与调试](/troubleshooting/inspection/)
