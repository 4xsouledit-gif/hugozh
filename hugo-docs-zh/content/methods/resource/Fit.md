+++
title = "Fit"
linkTitle = "Fit"
description = "返回按给定处理规格缩小适配后的新图像资源。"
date = 2026-10-02
weight = 90
source = "https://gohugo.io/methods/resource/fit/"

[params.functions_and_methods]
signatures = ["RESOURCE.Fit SPECIFICATION"]
returnType = "images.ImageResource"
+++

> [!NOTE]
> 该方法可用于全局资源、页面资源或远程资源。

`Fit` 方法依据给定的[处理规格](#处理规格)，从一张[processable image](g)（可处理的图像）返回新的资源。

> [!NOTE]
> 用 [`reflect.IsImageResourceProcessable`][] 函数判断图像是否可处理。

## 用法

适配时必须在规格中同时给出宽度和高度（例如 `300x175`）。`Fit` 会不断缩小图像直到它能放进指定尺寸，从而保持原始宽高比。与 [`Fill`][] 或 [`Resize`][] 不同，该方法绝不会放大图像；如果源图像小于目标尺寸，结果图像的尺寸与原图相同。

```go-html-template
{{ with resources.Get "images/original.jpg" }}
  {{ with .Fit "300x175" }}
    <img src="{{ .RelPermalink }}" width="{{ .Width }}" height="{{ .Height }}" alt="">
  {{ end }}
{{ end }}
```

上面的示例中，`"300x175"` 就是处理规格。

## 处理规格

处理规格是一个以空格分隔、大小写不敏感的列表，包含下列选项中的一个或多个，顺序任意：

action
: 指定 `crop`、`fill`、`fit` 或 `resize` 之一。适用于 [`Process`][] 方法和 [`images.Process`][] 滤镜。若指定了 action，还必须同时提供[尺寸](#dimensions)。

anchor
: 裁剪或填充图像时使用的焦点。可选值包括 `TopLeft`、`Top`、`TopRight`、`Left`、`Center`、`Right`、`BottomLeft`、`Bottom`、`BottomRight` 或 `Smart`。`Smart` 选项借助 [`muesli/smartcrop`][] 包找出图像中最值得保留的区域。默认取[成像配置][]中的 `anchor` 设置。

background color
: 把透明图像转换为不支持透明度的格式（例如 PNG 转 JPEG）时使用的背景色。当图像按非正交角度旋转、产生空白区域且处理规格中未指定背景色时，该颜色也用于填充空白。取值必须是 RGB [十六进制颜色][]。默认取[成像配置][]中的 `bgColor` 设置。

compression
: **（0.153.5 新增）** 编码策略，适用于 AVIF 和 WebP 图像。可选值为 `lossy` 或 `lossless`。默认取[成像配置][]中与格式对应的 `compression` 设置。

dimensions
: 结果图像的尺寸，单位为像素。格式为 `WIDTHxHEIGHT`，其中 `WIDTH` 与 `HEIGHT` 都是整数。缩放图像时可以只指定宽度（如 `600x`）或只指定高度（如 `x400`）以等比缩放；同时指定宽度和高度可能导致非等比缩放。裁剪、适配或填充时必须同时给出宽度和高度，如 `600x400`。

format
: 结果图像的格式。可选值包括 `avif`、`bmp`、`gif`、`jpeg`、`png`、`tiff` 或 `webp`。默认与源图像格式相同。

hint
: 内容提示，适用于 AVIF 和 WebP 图像。可选值包括 `drawing`、`icon`、`photo`、`picture` 或 `text`。默认取[成像配置][]中与格式对应的 `hint` 设置。

  取值|示例
  :--|:--
  `drawing`|带高对比细节的手绘或线稿
  `icon`|尺寸较小的彩色图像
  `photo`|自然光照下的户外照片
  `picture`|人像等室内照片
  `text`|以文字为主的图像

quality
: 视觉保真度，适用于 JPEG 图像，以及使用 `lossy` 压缩的 AVIF 和 WebP 图像。格式为 `qQUALITY`，其中 `QUALITY` 是 `1` 到 `100`（含两端）之间的整数。数值越小越优先考虑文件体积，数值越大越优先考虑视觉清晰度。默认取[成像配置][]中与格式对应的 `quality` 设置。

resampling filter
: 缩放、适配或填充图像时计算新像素所用的算法。常用选项包括 `box`、`lanczos`、`catmullRom`、`mitchellNetravali`、`linear` 或 `nearestNeighbor`。默认取[成像配置][]中的 `resampleFilter` 设置。

  滤镜|说明
  :--|:--
  `box`|简单快速的平均滤镜，适合缩小图像
  `lanczos`|高质量重采样滤镜，用于照片可获得锐利结果
  `catmullRom`|锐利的三次滤镜，比 Lanczos 更快而结果相近
  `mitchellNetravali`|三次滤镜，结果更平滑，振铃伪影比 CatmullRom 更少
  `linear`|双线性重采样滤镜，输出平滑，比三次滤镜更快
  `nearestNeighbor`|最快的重采样滤镜，不做抗锯齿

  可用重采样滤镜的完整列表见[源文档][]。若愿意以性能换取画质，可以试一试其他滤镜。

rotation
: 逆时针旋转图像的整角度数。格式为 `rDEGREES`，其中 `DEGREES` 是整数。Hugo 会在其他任何变换之前先执行旋转，因此你的[目标尺寸](#dimensions)和[锚点](#anchor)都应针对旋转后的图像方向。正交旋转用 `r90`、`r180` 或 `r270`，任意角度如 `r45`。要顺时针旋转，使用 `r-45` 这样的负数。要根据图像的 Exif 方向标记自动旋转，请改用 [`images.AutoOrient`][] 滤镜，而不是手动旋转。

  按非正交角度旋转会扩大图像范围以容纳旋转后的四角。对 AVIF、PNG、WebP 等支持 alpha 通道的格式，这些多出来的空白区域默认透明。若目标格式不支持透明度（如 JPEG），或在处理规格中显式指定了[背景色](#background-color)，空白区域会被填充。若需要颜色但处理字符串中没有指定，则默认取[成像配置][]中的 `bgColor` 设置。

## 示例

```go-html-template
{{ with resources.Get "images/original.jpg" }}
  {{ with .Fit "300x175" }}
    <img src="{{ .RelPermalink }}" width="{{ .Width }}" height="{{ .Height }}" alt="">
  {{ end }}
{{ end }}
```

英文原文此处用示例照片演示 `fit 300x175` 的前后对比效果；本站未收录该示例图。

[`Fill`]: /methods/resource/fill/
[`Process`]: /methods/resource/process/
[`Resize`]: /methods/resource/resize/
[`images.AutoOrient`]: /functions/images/autoorient/
[`images.Process`]: /functions/images/process/
[`muesli/smartcrop`]: https://github.com/muesli/smartcrop
[`reflect.IsImageResourceProcessable`]: /functions/reflect/isimageresourceprocessable/
[十六进制颜色]: https://developer.mozilla.org/en-US/docs/Web/CSS/hex-color
[成像配置]: /configuration/imaging/
[源文档]: https://github.com/disintegration/imaging#image-resizing
