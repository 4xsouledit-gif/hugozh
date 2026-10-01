+++
title = "transform.Plainify"
linkTitle = "Plainify"
description = "返回删除所有 HTML 标签后的字符串。"
date = 2026-10-02
weight = 100
source = "https://gohugo.io/functions/transform/plainify/"

[params.functions_and_methods]
signatures = ["transform.Plainify INPUT"]
returnType = "template.HTML"
aliases = ["plainify"]
+++

```go-html-template
{{ "<b>BatMan</b>" | plainify }} → BatMan
```
