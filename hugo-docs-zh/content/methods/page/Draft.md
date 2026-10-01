+++
title = "Draft"
linkTitle = "Draft"
description = "报告给定页面在前置元数据中是否被标记为草稿。"
date = 2026-10-02
weight = 140
source = "https://gohugo.io/methods/page/draft/"

[params.functions_and_methods]
signatures = ["PAGE.Draft"]
returnType = "bool"
+++

默认情况下，构建项目时 Hugo 不会发布草稿页面。要在构建项目时包含草稿页面，请使用 `--buildDrafts` 命令行标志。

```toml
title = 'Post 1'
draft = true
```

```go-html-template
{{ .Draft }} → true
```
