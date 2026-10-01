+++
title = "path.Base"
linkTitle = "Base"
description = "返回给定路径的最后一个元素；路径分隔符会先替换为斜杠（`/`）。"
date = 2026-10-02
weight = 20
source = "https://gohugo.io/functions/path/base/"

[params.functions_and_methods]
signatures = ["path.Base PATH"]
returnType = "string"
+++

```go-html-template
{{ path.Base "a/news.html" }} → news.html
{{ path.Base "news.html" }} → news.html
{{ path.Base "a/b/c" }} → c
{{ path.Base "/x/y/z/" }} → z
{{ path.Base "" }} → .
```
