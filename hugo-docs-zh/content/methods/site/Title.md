+++
title = "Title"
linkTitle = "Title"
description = "返回项目配置中定义的标题。"
date = 2026-10-02
weight = 260
source = "https://gohugo.io/methods/site/title/"

[params.functions_and_methods]
signatures = ["SITE.Title"]
returnType = "string"
+++

项目配置：

```toml
title = 'My Documentation Site'
```

模板：

```go-html-template
{{ .Site.Title }} → My Documentation Site
```
