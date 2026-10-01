+++
title = "os.ReadDir"
linkTitle = "ReadDir"
description = "返回按文件名排序的 FileInfo 结构数组，每个目录条目对应一个元素。"
date = 2026-10-02
weight = 40
source = "https://gohugo.io/functions/os/readdir/"

[params.functions_and_methods]
signatures = ["os.ReadDir PATH"]
returnType = "os.FileInfo"
aliases = ["readDir"]
+++

`os.ReadDir` 函数相对于项目目录的根解析路径。路径开头的分隔符（`/`）是可选的。

目录结构如下：

```tree
content/
├── about.md
├── contact.md
└── news/
    ├── article-1.md
    └── article-2.md
```

以下模板代码：

```go-html-template
{{ range readDir "content" }}
  {{ .Name }} → {{ .IsDir }}
{{ end }}
```

输出：

```html
about.md → false
contact.md → false
news → true
```

注意，`os.ReadDir` 不会递归。

`FileInfo` 结构的详细信息见 [Go 文档][Go documentation]。

[Go documentation]: https://pkg.go.dev/io/fs#FileInfo
