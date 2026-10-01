+++
title = "Permalink"
linkTitle = "Permalink"
description = "返回给定资源的永久链接，并在返回过程中发布该资源。"
date = 2026-10-02
weight = 150
source = "https://gohugo.io/methods/resource/permalink/"

[params.functions_and_methods]
signatures = ["RESOURCE.Permalink"]
returnType = "string"
+++

> [!NOTE]
> 该方法可用于全局资源、页面资源或远程资源。

`Resource` 对象上的 `Permalink` 方法把资源写入发布目录（通常是 `public`），并返回其[permalink](g)（永久链接）。

```go-html-template
{{ with resources.Get "images/a.jpg" }}
  {{ .Permalink }} → https://example.org/images/a.jpg
{{ end }}
```
