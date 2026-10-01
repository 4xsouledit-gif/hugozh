+++
title = "os.Stat"
linkTitle = "Stat"
description = "返回描述文件或目录的 FileInfo 结构。"
date = 2026-10-02
weight = 60
source = "https://gohugo.io/functions/os/stat/"

[params.functions_and_methods]
signatures = ["os.Stat PATH"]
returnType = "os.FileInfo"
+++

`os.Stat` 函数先尝试相对于项目目录的根解析路径。如果找不到匹配的文件或目录，它会尝试相对于 [`contentDir`][] 解析路径。路径开头的分隔符（`/`）是可选的。

```go-html-template
{{ $f := os.Stat "README.md" }}
{{ $f.IsDir }}    → false (bool)
{{ $f.ModTime }}  → 2021-11-25 10:06:49.315429236 -0800 PST (time.Time)
{{ $f.Name }}     → README.md (string)
{{ $f.Size }}     → 241 (int64)

{{ $d := os.Stat "content" }}
{{ $d.IsDir }}    → true (bool)
```

`FileInfo` 结构的详细信息见 [Go 文档][Go documentation]。

[Go documentation]: https://pkg.go.dev/io/fs#FileInfo
[`contentDir`]: /configuration/all/#contentdir
