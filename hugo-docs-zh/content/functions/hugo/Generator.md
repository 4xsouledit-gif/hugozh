+++
title = "hugo.Generator"
linkTitle = "hugo.Generator"
description = "返回一个 HTML meta 元素，用于标明生成本站的软件。"
date = 2026-10-02
weight = 70
source = "https://gohugo.io/functions/hugo/generator/"

[params.functions_and_methods]
signatures = ["hugo.Generator"]
returnType = "template.HTML"
+++

## 用法

```go-html-template
{{ hugo.Generator }} → <meta name="generator" content="Hugo 0.167.0">
```
