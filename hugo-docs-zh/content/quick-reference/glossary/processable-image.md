+++
title = "可处理图像（processable image）"
linkTitle = "可处理图像"
description = "媒体类型属于 Hugo 可解码、可编码范围的图像文件。"
date = 2026-10-02
weight = 1040
source = "https://gohugo.io/quick-reference/glossary/processable-image/"

[params.teach]
difficulty = "参考"
prereq = ["在文档里遇到不认识的 Hugo 术语时查阅"]
outcomes = ["判断某张图片能不能调用 `.Resize` 一类方法，并在构建报错时知道先回头核对媒体类型"]
next = ["/content-management/image-processing/"]
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

## 为什么重要

只有媒体类型落在上面这张清单里的图像才能调用 `.Resize`、`.Crop`、`.Filter` 等方法；对 SVG 或清单之外的格式调用，构建会直接失败，而报错往往只说某个方法不可用，要回到媒体类型才能定位。
因此处理图片前先用 `reflect.IsImageResourceProcessable` 判断，或者在模板里用 `with` 兜住，把 SVG 之类的文件按普通资源输出（例如直接放进 `<img>`），比让整站构建中断要好。

延伸阅读：[图像处理](/content-management/image-processing/) · [资源方法](/methods/resource/)

[`reflect.IsImageResourceProcessable`]: /functions/reflect/isimageresourceprocessable/
[资源方法]: /methods/resource/
