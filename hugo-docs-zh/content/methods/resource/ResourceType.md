+++
title = "ResourceType"
linkTitle = "ResourceType"
description = "返回给定资源媒体类型的主类型。"
date = 2026-10-02
weight = 200
source = "https://gohugo.io/methods/resource/resourcetype/"

[params.functions_and_methods]
signatures = ["RESOURCE.ResourceType"]
returnType = "string"
+++

> [!NOTE]
> 该方法可用于全局资源、页面资源或远程资源。

常见的资源类型包括 `audio`、`image`、`text` 和 `video`。

```go-html-template
{{ with resources.Get "image/a.jpg" }}
  {{ .ResourceType }} → image
  {{ .MediaType.MainType }} → image
{{ end }}
```

处理内容文件时，资源类型为 `page`。

```tree
content/
├── lessons/
│   ├── lesson-1/
│   │   ├── _objectives.md  <-- resource type = page
│   │   ├── _topics.md      <-- resource type = page
│   │   ├── _example.jpg    <-- resource type = image
│   │   └── index.md
│   └── _index.md
└── _index.md
```

用上面的结构，可以遍历类型为 `page` 的页面资源来构建内容：

```go-html-template {file="layouts/lessons/page.html"}
{{ range .Resources.ByType "page" }}
  {{ .Content }}
{{ end }}
```
