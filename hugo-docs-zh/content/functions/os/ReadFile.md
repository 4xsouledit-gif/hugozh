+++
title = "os.ReadFile"
linkTitle = "ReadFile"
description = "返回文件的内容。"
date = 2026-10-02
weight = 50
source = "https://gohugo.io/functions/os/readfile/"

[params.functions_and_methods]
signatures = ["os.ReadFile PATH"]
returnType = "string"
aliases = ["readFile"]
+++

`os.ReadFile` 函数先尝试相对于项目目录的根解析路径。如果找不到匹配的文件，它会尝试相对于 [`contentDir`][] 解析路径。路径开头的分隔符（`/`）是可选的。

假设项目目录根下有一个名为 README.md 的文件：

```md
This is **bold** text.
```

以下模板代码：

```go-html-template
{{ readFile "README.md" }}
```

输出：

```html
This is **bold** text.
```

注意，`os.ReadFile` 返回的是原始（未经解释）内容。

[`contentDir`]: /configuration/all/#contentdir
