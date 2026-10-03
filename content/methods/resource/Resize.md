+++
title = "Resize"
linkTitle = "Resize"
description = "返回按给定处理规格缩放后的新图像资源。"
date = 2026-10-02
weight = 190
source = "https://gohugo.io/methods/resource/resize/"

[params.functions_and_methods]
signatures = ["RESOURCE.Resize SPECIFICATION"]
returnType = "images.ImageResource"
+++

> [!NOTE]
> 该方法可用于全局资源、页面资源或远程资源。

`Resize` 方法依据给定的[处理规格](#处理规格)，从一张[processable image](g)（可处理的图像）返回新的资源。

> [!NOTE]
> 用 [`reflect.IsImageResourceProcessable`][] 函数判断图像是否可处理。

## 这一页解决什么问题

`Resize` 解决「**我要一个指定尺寸的图，怎么给都行**」：它会真的把图像缩放成你写的尺寸，等比或非等比都可以。它是四个变换方法里最「听话」的一个——不留白、不裁边（除非你同时给了宽和高），你写多少它就给你多少。

典型场景：为 `srcset` 生成多个宽度的候选图；把过大的原图压到合适的显示宽度；需要精确尺寸（例如固定 300×150 的卡片位）时接受轻微变形。

## 什么时候用，什么时候别用

四个变换方法的分工：

| 方法 | 缩放？ | 裁剪？ | 会放大吗？ | 结果尺寸 |
| --- | --- | --- | --- | --- |
| `Resize` | 是 | 否 | 会 | 写单边即等比；写双边即精确（可能变形） |
| [`Fit`](/methods/resource/fit/) | 是（等比缩小） | 否 | **不会** | 装得下即可，通常不等于请求值 |
| [`Fill`](/methods/resource/fill/) | 是 | 是（裁掉溢出） | 会 | 正好等于请求值 |
| [`Crop`](/methods/resource/crop/) | 否 | 是 | 不会 | 正好等于请求值（源图足够大时） |

**该用**：只要能缩放到目标尺寸、不介意等比/变形；做响应式候选图；把原图缩小到展示宽度。

**别用**：

- 不能变形、也不能裁 → 用 `Resize` 的**单边**写法（`300x`）或 `Fit`；
- 要求正好填满且允许裁边 → `Fill`；
- 只要取局部 → `Crop`；
- 还要转格式、调质量、旋转 → [`Process`](/methods/resource/process/)。

## 用法

按给定的处理规格缩放图像。等比缩放时可以只指定宽度（如 `300x`），也可以只指定高度（如 `x150`）。

如果同时指定宽度和高度（如 `300x150`），结果图像会被缩放到这两个精确尺寸。若目标宽高比与原始宽高比不同，图像会被非等比缩放（拉伸或压扁）。

```go-html-template
{{ with resources.Get "images/original.jpg" }}
  {{ with .Resize "300x" }}
    <img src="{{ .RelPermalink }}" width="{{ .Width }}" height="{{ .Height }}" alt="">
  {{ end }}
{{ end }}
```

上面的示例中，`"300x"` 就是处理规格。

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
  {{ with .Resize "300x" }}
    <img src="{{ .RelPermalink }}" width="{{ .Width }}" height="{{ .Height }}" alt="">
  {{ end }}
{{ end }}
```

英文原文此处用示例照片演示 `resize 300x` 的前后对比效果；本站未收录该示例图。

## 完整示例（实测）

测量条件：Hugo 0.167.0 extended，Windows；`assets/images/original.jpg` 是一张 600×400 的 JPEG。放进 `layouts/_default/single.html`：

```go-html-template {file="layouts/_default/single.html"}
{{ with resources.Get "images/original.jpg" }}
  {{ with .Resize "300x" }}<p>300x → {{ .Width }}x{{ .Height }}</p>{{ end }}
  {{ with .Resize "x150" }}<p>x150 → {{ .Width }}x{{ .Height }}</p>{{ end }}
  {{ with .Resize "300x150" }}<p>300x150 → {{ .Width }}x{{ .Height }}</p>{{ end }}
{{ end }}
```

Hugo 渲染为：

```html
<p>300x → 300x200</p>
<p>x150 → 225x150</p>
<p>300x150 → 300x150</p>
```

**你应当看到什么**：

- 只写宽度 `300x`：高度按原比例算出 200；
- 只写高度 `x150`：宽度按原比例算出 225；
- 同时写两个值 `300x150`：结果就是 300×150——源图是 3:2、目标 2:1，**画面被横向压扁了**。这是「没报错但结果不对」的典型来源。

放大同样有效（与 `Fit` 相反）：

```text
{{ .Resize "1200x" }} → 1200x800
```

## 返回值边界（实测）

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| 单边等比（`300x`） | 300×200（高度自动） | 否 |
| 单边等比（`x150`） | 225×150（宽度自动） | 否 |
| 双边（`300x150`） | 精确 300×150，**可能非等比变形** | 否 |
| 放大（`1200x`） | 1200×800，**会放大** | 否 |
| 两个维度都给 0（`0x`） | —— | 是：`error calling Resize: failed to resize image "…": must provide Width or Height` |
| 锚点：本方法不使用 | 写 `TopRight` 之类不会生效（缩放没有「取哪一块」的概念） | 否 |
| 对非图像资源调用 | —— | 是：`does not support this method: use reflect.IsImageResource…` |
| `resources.Get` 找不到文件（`nil`） | —— | 是：`nil pointer evaluating resource.Resource.Resize` |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 没报错但结果不对 | 图片被压扁/拉长 | 双边写法 `300x150` 与源图比例不一致 | 改成单边（`300x`）或 `Fit`；确实要裁边就用 `Fill` |
| 没报错但结果不对 | 小图被放大后发虚 | `Resize` 会放大 | 改用 `Fit`（绝不放大），或换成更大的源图 |
| 报错看不懂 | `must provide Width or Height` | `0x`、`x0` 这类没有任何有效维度的规格 | 至少给一个非零维度 |
| 没报错但结果不对 | 写了锚点却没起作用 | `Resize` 不涉及裁剪区域 | 锚点交给 `Fill`/`Crop`/`Process` |

更多排查入口见[故障排查](/troubleshooting/)。

[`Process`]: /methods/resource/process/
[`images.AutoOrient`]: /functions/images/autoorient/
[`images.Process`]: /functions/images/process/
[`muesli/smartcrop`]: https://github.com/muesli/smartcrop
[`reflect.IsImageResourceProcessable`]: /functions/reflect/isimageresourceprocessable/
[十六进制颜色]: https://developer.mozilla.org/en-US/docs/Web/CSS/hex-color
[成像配置]: /configuration/imaging/
[源文档]: https://github.com/disintegration/imaging#image-resizing
