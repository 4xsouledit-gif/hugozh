+++
title = "可处理图像（processable image）"
linkTitle = "可处理图像"
description = "媒体类型属于 Hugo 可解码、可编码范围的图像文件。"
date = 2026-10-02
weight = 1040
source = "https://gohugo.io/quick-reference/glossary/processable-image/"
+++

可处理图像（processable image）是媒体类型属于以下 [media types](g) 之一的图像文件：

- `image/avif`
- `image/bmp`
- `image/gif`
- `image/jpeg`
- `image/png`
- `image/tiff`
- `image/webp`

Hugo 可以解码和编码这些图像格式，因此你可以使用任何适用于图像的[资源方法][]，例如 `Width`、`Height`、`Crop`、`Fill`、`Fit`、`Filter`、`Process`、`Resize` 等。

使用 [`reflect.IsImageResourceProcessable`][] 函数判断图像是否可以被处理。

[`reflect.IsImageResourceProcessable`]: /functions/reflect/isimageresourceprocessable/
[资源方法]: /methods/resource/
