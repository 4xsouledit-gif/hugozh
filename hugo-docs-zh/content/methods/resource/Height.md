+++
title = "Height"
linkTitle = "Height"
description = "返回给定图像资源的高度。"
date = 2026-10-02
weight = 100
source = "https://gohugo.io/methods/resource/height/"

[params.functions_and_methods]
signatures = ["RESOURCE.Height"]
returnType = "int"
+++

> [!NOTE]
> 该方法可用于全局资源、页面资源或远程资源。

调用 `Height` 方法之前，请先用 [`reflect.IsImageResourceWithMeta`][] 函数确认 Hugo 能否确定图像尺寸。

```go-html-template
{{ with resources.GetMatch "images/featured.*" }}
  {{ if reflect.IsImageResourceWithMeta . }}
    <img src="{{ .RelPermalink }}" width="{{ .Width }}" height="{{ .Height }}" alt="">
  {{ else }}
    <img src="{{ .RelPermalink }}" alt="">
  {{ end }}
{{ end }}
```

[`reflect.IsImageResourceWithMeta`]: /functions/reflect/isimageresourcewithmeta/
