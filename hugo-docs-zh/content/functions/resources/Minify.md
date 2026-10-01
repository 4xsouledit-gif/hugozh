+++
title = "resources.Minify"
linkTitle = "Minify"
description = "返回给定资源压缩后的版本。"
date = 2026-10-02
weight = 120
source = "https://gohugo.io/functions/resources/minify/"

[params.functions_and_methods]
signatures = ["resources.Minify RESOURCE"]
returnType = "resource.Resource"
aliases = ["minify"]
+++

> [!NOTE]
> 该函数可用于全局资源、页面资源或远程资源。

```go-html-template
{{ $css := resources.Get "css/main.css" }}
{{ $style := $css | minify }}
```

任何 CSS、JS、JSON、HTML、SVG 或 XML 资源都可以用 resources.Minify 压缩，它以资源对象为参数。
