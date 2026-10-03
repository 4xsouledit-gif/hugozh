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

## 这一页解决什么问题

`Fit` 解决的是「**把整张图装进这个框，别裁掉任何内容，也别放大**」：它等比缩小图像，直到宽和高都不超过你写的尺寸。结果尺寸是「能放下的最大等比尺寸」，所以宽高通常不会正好等于你写的数值。

典型场景：文章正文插图、日志配图——内容完整比填满容器重要；用户上传的大图做预览，绝不允许放大成糊图。

## 什么时候用，什么时候别用

四个变换方法的分工：

| 方法 | 缩放？ | 裁剪？ | 会放大吗？ | 一句话 |
| --- | --- | --- | --- | --- |
| `Fit` | 是（等比缩小） | 否 | **不会** | 缩到装得进为止 |
| [`Fill`](/methods/resource/fill/) | 是 | 是（裁掉溢出） | 会 | 铺满目标框后裁边 |
| [`Resize`](/methods/resource/resize/) | 是 | 否 | 会 | 直接缩到指定尺寸（可能变形） |
| [`Crop`](/methods/resource/crop/) | 否 | 是 | 不会 | 只裁不缩 |

**该用**：不能裁内容（图表、截图、含文字的海报）；不确定源图大小、又必须防止放大；做响应式 `srcset` 时生成「长边不超过 N」的候选图。

**别用**：

- 容器必须被填满、能接受裁边 → `Fill`；
- 必须得到**精确**的宽高（例如固定 300×150 的广告位）→ `Resize`（接受变形）或 `Fill`（接受裁边）；
- 只取局部 → `Crop`。

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

## 完整示例（实测）

测量条件：Hugo 0.167.0 extended，Windows；`assets/images/original.jpg` 是一张 600×400 的 JPEG。放进 `layouts/_default/single.html`：

```go-html-template {file="layouts/_default/single.html"}
{{ with resources.Get "images/original.jpg" }}
  {{ with .Fit "300x175" }}<img src="{{ .RelPermalink }}" width="{{ .Width }}" height="{{ .Height }}" alt="">{{ end }}
  {{ with .Fit "1000x1000" }}<p>放大请求 1000x1000 实得 {{ .Width }}x{{ .Height }}</p>{{ end }}
{{ end }}
```

Hugo 渲染为：

```html
<img src="/images/original_hu_faa28ef0bd53561a.jpg" width="263" height="175" alt="">
<p>放大请求 1000x1000 实得 600x400</p>
```

**你应当看到什么**：两处结果都**不是**你请求的尺寸，但都没出错——

- 请求 `300x175`：600×400 是 3:2，装进 300×175 时高度是瓶颈，等比缩到 **263×175**（宽 263 < 300，左右留空，但内容完整）；
- 请求 `1000x1000`：比源图大，`Fit` **拒绝放大**，原样返回 **600×400**。

这就是 `Fit` 与 `Resize` 最本质的区别：`Resize "1000x"` 会给你 1000×667 的放大图，`Fit "1000x1000"` 只给你 600×400。

## 返回值边界（实测）

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| 目标小于源图（`300x175`） | 等比缩小到能装下（实测 263×175），**尺寸通常不等于请求值** | 否 |
| 目标大于源图（`1000x1000`） | 原样返回源图尺寸（实测 600×400），**绝不放大** | 否 |
| 只写一个维度（`300x`、`x150`） | —— | 是：`error calling Fit: failed to fit image "…": must provide Width and Height` |
| 目标宽高比与源图一致 | 结果正好等于请求尺寸 | 否 |
| 对非图像资源调用 | —— | 是：`does not support this method: use reflect.IsImageResource…` |
| `resources.Get` 找不到文件（`nil`） | —— | 是：`nil pointer evaluating resource.Resource.Fit` |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 没报错但结果不对 | `width` 属性写了请求值，图片实际尺寸却不一致 | `Fit` 只保证「装得下」，尺寸是等比算出来的 | 用 `.Width`/`.Height` 输出真实尺寸（见示例），不要手写数字 |
| 没报错但结果不对 | 请求放大后图片没变大 | `Fit` 不放大 | 需要放大就用 `Resize` 或 `Fill` |
| 没报错但结果不对 | 图片被压扁 | 用了 `Resize "300x150"` 这类双维度缩放 | 改 `Resize "300x"` 或 `Fit "300x150"` |
| 报错看不懂 | `must provide Width and Height` | 适配必须同时给出宽和高 | 写成 `300x175` |

更多排查入口见[故障排查](/troubleshooting/)。

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
