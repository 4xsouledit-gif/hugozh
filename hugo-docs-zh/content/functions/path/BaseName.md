+++
title = "path.BaseName"
linkTitle = "BaseName"
description = "返回给定路径的最后一个元素并去掉扩展名（如果有）；路径分隔符会先替换为斜杠（`/`）。"
date = 2026-10-02
weight = 30
source = "https://gohugo.io/functions/path/basename/"

[params.functions_and_methods]
signatures = ["path.BaseName PATH"]
returnType = "string"
+++

```go-html-template
{{ path.BaseName "a/news.html" }} → news
{{ path.BaseName "news.html" }} → news
{{ path.BaseName "a/b/c" }} → c
{{ path.BaseName "/x/y/z/" }} → z
{{ path.BaseName "" }} → .
```
