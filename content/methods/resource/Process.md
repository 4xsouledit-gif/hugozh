+++
title = "Process"
linkTitle = "Process"
description = "返回按给定处理规格处理后的新图像资源。"
date = 2026-10-02
weight = 160
source = "https://gohugo.io/methods/resource/process/"

[params.functions_and_methods]
signatures = ["RESOURCE.Process SPECIFICATION"]
returnType = "images.ImageResource"
+++

> [!NOTE]
> 该方法可用于全局资源、页面资源或远程资源。

`Process` 方法依据给定的[处理规格](#处理规格)，从一张[processable image](g)（可处理的图像）返回新的资源。

> [!NOTE]
> 用 [`reflect.IsImageResourceProcessable`][] 函数判断图像是否可处理。

## 这一页解决什么问题

`Process` 是图像处理的「一条龙」：**把整套变换写进一条空格分隔的规格字符串**，一次完成缩放、裁剪、旋转、转格式、调质量。当你需要「裁成方形 + 转 WebP + 质量 50」这种组合时，它比连续调用 `Crop`、`Resize`、再想办法转格式要干净得多。

它对尺寸的处理与专用方法不同：**要改尺寸就必须在规格里写出 action**（`crop`/`fill`/`fit`/`resize`）。只写 `300x` 会直接报错，这是最容易踩的一点（见下文实测）。

## 什么时候用，什么时候别用

**该用**：

- 一次要做**两件以上**的事（裁 + 转格式 + 调质量）；
- 要转格式（WebP/AVIF 等）或旋转；
- 想把变换写成可配置的字符串（例如来自站点参数），而不是写死一串方法调用；
- 在滤镜链里需要整套变换 → 用 [`images.Process`](/functions/images/process/) 滤镜配合 [`Filter`](/methods/resource/filter/)。

**别用**：

- 只做一件事 → 用专用方法更清楚：改尺寸 [`Resize`](/methods/resource/resize/)、裁一块 [`Crop`](/methods/resource/crop/)、装进框 [`Fit`](/methods/resource/fit/)、铺满框 [`Fill`](/methods/resource/fill/)、加效果 [`Filter`](/methods/resource/filter/)；
- 想靠规格里的拼写错误发现笔误 → `Process` **不会**报「未知关键字」的错（实测，见下），拼错格式名会静默失败。

## 用法

这个方法功能全面，能在一条规格字符串中完成完整的图像变换，包括缩放、裁剪、旋转与格式转换。与 [`Resize`][]、[`Crop`][] 这类专用方法不同，如果要改变图像尺寸，你必须在规格中显式写出 [action](#action)。

```go-html-template
{{ with resources.Get "images/original.jpg" }}
  {{ with .Process "crop 200x200 TopRight webp q50" }}
    <img src="{{ .RelPermalink }}" width="{{ .Width }}" height="{{ .Height }}" alt="">
  {{ end }}
{{ end }}
```

上面的示例中，`"crop 200x200 TopRight webp q50"` 就是处理规格。

也可以用该方法做旋转、格式转换等简单变换：

```go-html-template
{{/* Rotate 90 degrees counter-clockwise. */}}
{{ $image := $image.Process "r90" }}

{{/* Convert to WebP. */}}
{{ $image := $image.Process "webp" }}
```

`Process` 方法也可以作为滤镜使用。如果需要对一张图像应用多个滤镜，这种方式更有效。详见 [`images.Process`][]。

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
  {{ with .Process "crop 200x200 TopRight webp q50" }}
    <img src="{{ .RelPermalink }}" width="{{ .Width }}" height="{{ .Height }}" alt="">
  {{ end }}
{{ end }}
```

英文原文此处用示例照片演示 `crop 200x200 TopRight webp q50` 的前后对比效果；本站未收录该示例图。

## 完整示例（实测）

测量条件：Hugo 0.167.0 extended，Windows；`assets/images/original.jpg` 是一张 600×400 的 JPEG。放进 `layouts/_default/single.html`：

```go-html-template {file="layouts/_default/single.html"}
{{ with resources.Get "images/original.jpg" }}
  {{ with .Process "crop 200x200 TopRight webp q50" }}
    <img src="{{ .RelPermalink }}" width="{{ .Width }}" height="{{ .Height }}" alt="">
  {{ end }}
{{ end }}
```

Hugo 渲染为：

```html
<img src="/images/original_hu_fdcd68e7d22ca54f.webp" width="200" height="200" alt="">
```

**你应当看到什么**：一句话完成了三件事——裁剪成 200×200、转成 WebP、质量 50；URL 的后缀变成 `.webp`、MIME 也随之改变（实测 `.MediaType.Type` 为 `image/webp`）。

再试只做旋转、只做转格式：

```text
.Process "r90"   → 400x600（宽高互换，逆时针 90 度）
.Process "webp"  → MediaType.Type 变成 image/webp
.Process "grayscale" → 生效（等价于 images.Grayscale 滤镜）
```

**必须注意的两个实测行为**：

```text
.Process "300x"
→ error calling Process: failed to  image "…": width or height are not supported for this action

.Process "crop"
→ error calling Process: failed to  image "…": must provide Width and Height
```

第一条说明：**写了尺寸就一定要写 action**（对照上游「要改变图像尺寸必须在规格中显式写出 action」）。第二条说明：`crop`/`fill`/`fit` 这些 action 需要成对的宽高。

而**拼错的关键字不会报错**：

```text
.Process "web"   → 不报错，输出的仍是 image/jpeg（"web" 被忽略）
.Process "bogus" → 不报错，输出的仍是 image/jpeg、尺寸不变
```

也就是说，`Process` 的规格里出现无法识别的词时会被**静默忽略**。所以「转 WebP 没生效」这类问题，第一件事是核对拼写，而不是怀疑缓存。

## 返回值边界（实测）

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| `crop 200x200 TopRight webp q50` | 200×200、`image/webp` 的新资源 | 否 |
| `r90` | 400×600（旋转后宽高互换） | 否 |
| `webp` | `image/webp`，尺寸不变 | 否 |
| `grayscale` | 灰度效果，尺寸不变 | 否 |
| 写了尺寸但没写 action（`300x`） | —— | 是：`width or height are not supported for this action` |
| 写了 `crop`/`fill`/`fit` 但没写尺寸 | —— | 是：`must provide Width and Height` |
| 规格里有无法识别的词（`web`、`bogus`） | **静默忽略**，按剩余可识别的选项出图 | 否 |
| 对非图像资源调用 | —— | 是：`does not support this method: use reflect.IsImageResource…` |
| `resources.Get` 找不到文件（`nil`） | —— | 是：`nil pointer evaluating resource.Resource.Process` |

> [!TIP]
> 规格字符串里的选项**大小写不敏感、顺序任意**（上游说明）。但拼写要准确：无法识别的词既不生效也不报错。

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 没报错但结果不对 | 转 WebP 没生效，还是 JPEG | 格式名拼错（如 `web`），被静默忽略 | 核对格式名：`avif`、`bmp`、`gif`、`jpeg`、`png`、`tiff`、`webp` |
| 没报错但结果不对 | 质量参数没起作用 | 质量只在 JPEG，以及 `lossy` 的 AVIF/WebP 上有效；写成 `q50` 才被识别 | 写 `q50`，并确认目标格式支持 |
| 报错看不懂 | `width or height are not supported for this action` | 只写了尺寸、没写 action | 补 action：`crop 300x200`、`resize 300x`、`fit 300x200`、`fill 300x200` |
| 报错看不懂 | `must provide Width and Height` | `crop`/`fill`/`fit` 缺成对尺寸 | 写成 `crop 200x200 …` |
| 没报错但结果不对 | 旋转后尺寸与预期不符 | Hugo 先旋转、再按你写的尺寸处理，锚点/尺寸要针对旋转后的方向（上游说明） | 调整规格顺序或尺寸，参考「处理规格」一节 |

更多排查入口见[故障排查](/troubleshooting/)。

[`Crop`]: /methods/resource/crop/
[`Process`]: /methods/resource/process/
[`Resize`]: /methods/resource/resize/
[`images.AutoOrient`]: /functions/images/autoorient/
[`images.Process`]: /functions/images/process/
[`muesli/smartcrop`]: https://github.com/muesli/smartcrop
[`reflect.IsImageResourceProcessable`]: /functions/reflect/isimageresourceprocessable/
[十六进制颜色]: https://developer.mozilla.org/en-US/docs/Web/CSS/hex-color
[成像配置]: /configuration/imaging/
[源文档]: https://github.com/disintegration/imaging#image-resizing
