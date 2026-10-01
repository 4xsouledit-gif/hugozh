+++
title = "path.Ext"
linkTitle = "Ext"
description = "返回给定路径的文件扩展名；路径分隔符会先替换为斜杠（`/`）。"
date = 2026-10-02
weight = 60
source = "https://gohugo.io/functions/path/ext/"

[params.functions_and_methods]
signatures = ["path.Ext PATH"]
returnType = "string"
+++

扩展名是路径中最后一个以斜杠分隔的元素里、从最后一个点开始的后缀；如果没有点，则为空字符串。

```go-html-template
{{ path.Ext "a/b/c/news.html" }} → .html
```
