+++
title = "images.Filter"
linkTitle = "Filter"
description = "返回一个新的图像资源，它是把一个或多个图像滤镜应用到给定图像资源后得到的结果。"
date = 2026-10-02
weight = 90
source = "https://gohugo.io/functions/images/filter/"

[params.functions_and_methods]
signatures = ["images.Filter FILTER... RESOURCE"]
returnType = "images.ImageResource"
+++

> [!NOTE]
> 该函数可用于全局资源、页面资源或远程资源。

`images.Filter` 函数对一个[可处理的图像][]应用一个或多个[图像滤镜](#image-filters)后返回一个新的资源。

> [!NOTE]
> 用 [`reflect.IsImageResourceProcessable`][] 函数判断图像是否可处理。

## 用法

用 `images.Filter` 函数应用模糊、锐化、灰度转换等效果。可以传入单个滤镜，也可以传入滤镜切片。传入切片时，Hugo 从左到右依次应用这些滤镜。

应用单个滤镜：

```go-html-template
{{ with resources.Get "images/original.jpg" }}
  {{ with images.Filter images.Grayscale . }}
    <img src="{{ .RelPermalink }}" width="{{ .Width }}" height="{{ .Height }}" alt="">
  {{ end }}
{{ end }}
```

应用两个或更多滤镜，从左到右依次执行：

```go-html-template
{{ $filters := slice
  images.Grayscale
  (images.GaussianBlur 8)
}}
{{ with resources.Get "images/original.jpg" }}
  {{ with images.Filter $filters . }}
    <img src="{{ .RelPermalink }}" width="{{ .Width }}" height="{{ .Height }}" alt="">
  {{ end }}
{{ end }}
```

也可以在 `Resource` 对象上调用 [`Filter`][] 方法应用图像滤镜。

## 示例

```go-html-template
{{ with resources.Get "images/original.jpg" }}
  {{ with images.Filter images.Grayscale . }}
    <img src="{{ .RelPermalink }}" width="{{ .Width }}" height="{{ .Height }}" alt="">
  {{ end }}
{{ end }}
```

英文原文此处用示例照片演示 `Grayscale` 滤镜的前后对比效果；本站未收录该示例图。

## 图像滤镜

以下滤镜都可以与 `images.Filter` 函数配合使用，也可以在 `Resource` 对象上通过 `Filter` 方法使用。

- [images.AutoOrient](/functions/images/autoorient/)
- [images.Brightness](/functions/images/brightness/)
- [images.ColorBalance](/functions/images/colorbalance/)
- [images.Colorize](/functions/images/colorize/)
- [images.Contrast](/functions/images/contrast/)
- [images.Dither](/functions/images/dither/)
- [images.Gamma](/functions/images/gamma/)
- [images.GaussianBlur](/functions/images/gaussianblur/)
- [images.Grayscale](/functions/images/grayscale/)
- [images.Hue](/functions/images/hue/)
- [images.Invert](/functions/images/invert/)
- [images.Mask](/functions/images/mask/)
- [images.Opacity](/functions/images/opacity/)
- [images.Overlay](/functions/images/overlay/)
- [images.Padding](/functions/images/padding/)
- [images.Pixelate](/functions/images/pixelate/)
- [images.Process](/functions/images/process/)
- [images.Saturation](/functions/images/saturation/)
- [images.Sepia](/functions/images/sepia/)
- [images.Sigmoid](/functions/images/sigmoid/)
- [images.Text](/functions/images/text/)
- [images.UnsharpMask](/functions/images/unsharpmask/)

[可处理的图像]: /content-management/image-processing/
[`Filter`]: /methods/resource/filter/
[`reflect.IsImageResourceProcessable`]: /functions/reflect/isimageresourceprocessable/
