+++
title = "Copyright"
linkTitle = "Copyright"
description = "返回项目配置中定义的版权声明。"
date = 2026-10-02
weight = 50
source = "https://gohugo.io/methods/site/copyright/"

[params.functions_and_methods]
signatures = ["SITE.Copyright"]
returnType = "string"
+++

项目配置：

```toml
copyright = '© 2023 ABC Widgets, Inc.'
```

模板：

```go-html-template
{{ .Site.Copyright }} → © 2023 ABC Widgets, Inc.
```
