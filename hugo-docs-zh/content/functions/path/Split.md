+++
title = "path.Split"
linkTitle = "Split"
description = "返回给定路径的目录与文件名两部分，分割点在最后一个斜杠之后；路径分隔符会先替换为斜杠（`/`）。"
date = 2026-10-02
weight = 80
source = "https://gohugo.io/functions/path/split/"

[params.functions_and_methods]
signatures = ["path.Split PATH"]
returnType = "paths.DirFile"
+++

如果给定路径中没有斜杠，`path.Split` 返回的目录为空，文件名部分就是整条路径。两个返回值满足 path = dir+file。

```go-html-template
{{ $dirFile := path.Split "a/news.html" }}
{{ $dirFile.Dir }} → a/
{{ $dirFile.File }} → news.html

{{ $dirFile := path.Split "news.html" }}
{{ $dirFile.Dir }} → "" (empty string)
{{ $dirFile.File }} → news.html

{{ $dirFile := path.Split "a/b/c" }}
{{ $dirFile.Dir }} → a/b/
{{ $dirFile.File }} → c
```
