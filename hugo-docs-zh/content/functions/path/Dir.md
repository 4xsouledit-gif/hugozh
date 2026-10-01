+++
title = "path.Dir"
linkTitle = "Dir"
description = "返回给定路径中除最后一个元素以外的部分；路径分隔符会先替换为斜杠（`/`）。"
date = 2026-10-02
weight = 50
source = "https://gohugo.io/functions/path/dir/"

[params.functions_and_methods]
signatures = ["path.Dir PATH"]
returnType = "string"
+++

```go-html-template
{{ path.Dir "a/news.html" }} → a
{{ path.Dir "news.html" }} → .
{{ path.Dir "a/b/c" }} → a/b
{{ path.Dir "/a/b/c" }} → /a/b
{{ path.Dir "/a/b/c/" }} → /a/b/c
{{ path.Dir "" }} → .
```
