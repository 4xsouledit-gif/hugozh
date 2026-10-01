+++
title = "Description"
linkTitle = "Description"
description = "返回前置元数据中定义的页面描述。"
date = 2026-10-02
weight = 130
source = "https://gohugo.io/methods/page/description/"

[params.functions_and_methods]
signatures = ["PAGE.Description"]
returnType = "string"
+++

页面描述在概念上不同于[内容摘要][]，通常用于页面自身的元数据。

```toml
title = 'How to make spicy tuna hand rolls'
description = 'Instructions for making spicy tuna hand rolls.'
```

```go-html-template {file="layouts/baseof.html"}
<head>
  <meta name="description" content="{{ .Description }}">
</head>
```

[内容摘要]: /content-management/summaries/
