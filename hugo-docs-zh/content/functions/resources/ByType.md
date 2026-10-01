+++
title = "resources.ByType"
linkTitle = "ByType"
description = "返回给定媒体类型的全局资源集合；一个都没有时返回 nil。"
date = 2026-10-02
weight = 20
source = "https://gohugo.io/functions/resources/bytype/"

[params.functions_and_methods]
signatures = ["resources.ByType MEDIATYPE"]
returnType = "resource.Resources"
+++

[媒体类型][]通常是 `image`、`text`、`audio`、`video` 或 `application` 之一。

```go-html-template
{{ range resources.ByType "image" }}
  <img src="{{ .RelPermalink }}" width="{{ .Width }}" height="{{ .Height }}" alt="">
{{ end }}
```

> [!NOTE]
> 该函数作用于全局资源。全局资源是位于 `assets` 目录内，或位于任何挂载到 `assets` 目录的目录内的文件。
>
> 对于页面资源，请使用 `Page` 对象上的 [`Resources.ByType`][] 方法。

[`Resources.ByType`]: /methods/page/resources/
[媒体类型]: https://en.wikipedia.org/wiki/Media_type
