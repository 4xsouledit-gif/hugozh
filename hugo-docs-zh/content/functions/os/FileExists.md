+++
title = "os.FileExists"
linkTitle = "FileExists"
description = "报告文件或目录是否存在。"
date = 2026-10-02
weight = 20
source = "https://gohugo.io/functions/os/fileexists/"

[params.functions_and_methods]
signatures = ["os.FileExists PATH"]
returnType = "bool"
aliases = ["fileExists"]
+++

`os.FileExists` 函数先尝试相对于项目目录的根解析路径。如果找不到匹配的文件或目录，它会尝试相对于 [`contentDir`][] 解析路径。路径开头的分隔符（`/`）是可选的。

目录结构如下：

```tree
content/
├── about.md
├── contact.md
└── news/
    ├── article-1.md
    └── article-2.md
```

该函数返回以下值：

```go-html-template
{{ fileExists "content" }} → true
{{ fileExists "content/news" }} → true
{{ fileExists "content/news/article-1" }} → false
{{ fileExists "content/news/article-1.md" }} → true
{{ fileExists "news" }} → true
{{ fileExists "news/article-1" }} → false
{{ fileExists "news/article-1.md" }} → true
```

[`contentDir`]: /configuration/all/#contentdir
