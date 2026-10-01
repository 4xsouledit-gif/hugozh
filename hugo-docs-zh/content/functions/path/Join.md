+++
title = "path.Join"
linkTitle = "Join"
description = "把给定的路径元素拼接为单个路径，返回与之等价的最短路径名；路径分隔符会先替换为斜杠（`/`）。"
date = 2026-10-02
weight = 70
source = "https://gohugo.io/functions/path/join/"

[params.functions_and_methods]
signatures = ["path.Join ELEMENT..."]
returnType = "string"
+++

详见 Go 的 [`path.Join`][] 与 [`path.Clean`][] 文档。

```go-html-template
{{ path.Join "partial" "news.html" }} → partial/news.html
{{ path.Join "partial/" "news.html" }} → partial/news.html
{{ path.Join "foo/bar" "baz" }} → foo/bar/baz
{{ path.Join "foo" "bar" "baz" }} → foo/bar/baz
{{ path.Join "foo" "" "baz" }} → foo/baz
{{ path.Join "foo" "." "baz" }} → foo/baz
{{ path.Join "foo" ".." "baz" }} → baz
{{ path.Join "/.." "foo" ".." "baz" }} → baz
```

[`path.Clean`]: https://pkg.go.dev/path#Clean
[`path.Join`]: https://pkg.go.dev/path#Join
