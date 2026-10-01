+++
title = "resources.Copy"
linkTitle = "Copy"
description = "返回给定资源在目标路径上的副本。"
date = 2026-10-02
weight = 40
source = "https://gohugo.io/functions/resources/copy/"

[params.functions_and_methods]
signatures = ["resources.Copy TARGETPATH RESOURCE"]
returnType = "resource.Resource"
+++

> [!NOTE]
> 该函数可用于全局资源、页面资源或远程资源。

```go-html-template
{{ with resources.Get "images/a.jpg" }}
  {{ with resources.Copy "img/new-image-name.jpg" . }}
    <img src="{{ .RelPermalink }}" width="{{ .Width }}" height="{{ .Height }}" alt="">
  {{ end }}
{{ end }}
```

`TARGETPATH` 相对于站点根目录。

> [!NOTE]
> 可以在全局资源、页面资源与远程资源上使用 `resources.Copy` 函数。
