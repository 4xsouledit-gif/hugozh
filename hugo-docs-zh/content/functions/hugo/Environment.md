+++
title = "hugo.Environment"
linkTitle = "hugo.Environment"
description = "返回当前运行的环境。"
date = 2026-10-02
weight = 60
source = "https://gohugo.io/functions/hugo/environment/"

[params.functions_and_methods]
signatures = ["hugo.Environment"]
returnType = "string"
+++

## 用法

`hugo.Environment` 函数返回当前运行的环境，其取值由 `--environment` 命令行标志决定。

```go-html-template
{{ hugo.Environment }} → production
```

命令行示例：

命令|环境
:--|:--
`hugo build`|`production`
`hugo build --environment staging`|`staging`
`hugo server`|`development`
`hugo server --environment staging`|`staging`
