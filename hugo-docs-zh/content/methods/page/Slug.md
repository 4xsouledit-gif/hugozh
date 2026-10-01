+++
title = "Slug"
linkTitle = "Slug"
description = "返回给定页面前置元数据中定义的 URL slug。"
date = 2026-10-02
weight = 790
source = "https://gohugo.io/methods/page/slug/"

[params.functions_and_methods]
signatures = ["PAGE.Slug"]
returnType = "string"
+++

```toml
title = 'How to make spicy tuna hand rolls'
slug = 'sushi'
```

该页面将通过以下地址访问：

    https://example.org/recipes/sushi

要在模板中获取 slug 值：

```go-html-template
{{ .Slug }} → sushi
```
