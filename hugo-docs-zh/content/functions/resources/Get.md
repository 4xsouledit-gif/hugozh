+++
title = "resources.Get"
linkTitle = "Get"
description = "返回给定路径上的全局资源；找不到时返回 nil。"
date = 2026-10-02
weight = 80
source = "https://gohugo.io/functions/resources/get/"

[params.functions_and_methods]
signatures = ["resources.Get PATH"]
returnType = "resource.Resource"
+++

```go-html-template
{{ with resources.Get "images/a.jpg" }}
  <img src="{{ .RelPermalink }}" width="{{ .Width }}" height="{{ .Height }}" alt="">
{{ end }}
```

> [!NOTE]
> 该函数作用于全局资源。全局资源是位于 `assets` 目录内，或位于任何挂载到 `assets` 目录的目录内的文件。
>
> 对于页面资源，请使用 `Page` 对象上的 [`Resources.Get`][] 方法。

[`Resources.Get`]: /methods/page/resources/#get
