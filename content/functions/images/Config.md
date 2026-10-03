+++
title = "images.Config"
linkTitle = "Config"
description = "返回指定路径（相对于工作目录）图像对应的 image.Config 结构。"
date = 2026-10-02
weight = 60
source = "https://gohugo.io/functions/images/config/"
aliases = ["/functions/imageconfig"]

[params.functions_and_methods]
signatures = ["images.Config PATH"]
returnType = "image.Config"
+++

> [!NOTE]
> 这是一个旧版（legacy）函数，已被全局资源、页面资源和远程资源的 [`Width`][] 与 [`Height`][] 方法取代。详见[图像处理][]一节。

```go-html-template
{{ $ic := images.Config "/static/images/a.jpg" }}

{{ $ic.Width }} → 600 (int)
{{ $ic.Height }} → 400 (int)
```

支持的图像格式包括 AVIF、BMP、GIF、HEIC、HEIF、JPEG、PNG、TIFF 和 WebP。

Hugo 会缓存结果，因此用同一路径多次调用该函数不会带来额外开销。

[`Height`]: /methods/resource/height/
[`Width`]: /methods/resource/width/
[图像处理]: /content-management/image-processing/
