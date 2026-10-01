+++
title = "path.Clean"
linkTitle = "Clean"
description = "返回与给定路径等价的最短路径名；路径分隔符会先替换为斜杠（`/`）。"
date = 2026-10-02
weight = 40
source = "https://gohugo.io/functions/path/clean/"

[params.functions_and_methods]
signatures = ["path.Clean PATH"]
returnType = "string"
+++

详见 Go 的 [`path.Clean`][] 文档。

```go-html-template
{{ path.Clean "foo/bar" }} → foo/bar
{{ path.Clean "/foo/bar" }} → /foo/bar
{{ path.Clean "/foo/bar/" }} → /foo/bar
{{ path.Clean "/foo//bar/" }} → /foo/bar
{{ path.Clean "/foo/./bar/" }} → /foo/bar
{{ path.Clean "/foo/../bar/" }} → /bar
{{ path.Clean "/../foo/../bar/" }} → /bar
{{ path.Clean "" }} → .
```

[`path.Clean`]: https://pkg.go.dev/path#Clean
