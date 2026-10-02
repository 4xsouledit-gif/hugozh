+++
title = "Crop"
linkTitle = "Crop"
description = "返回按给定处理规格裁剪后的新图像资源。"
date = 2026-10-02
weight = 30
source = "https://gohugo.io/methods/resource/crop/"

[params.functions_and_methods]
signatures = ["RESOURCE.Crop SPECIFICATION"]
returnType = "images.ImageResource"
+++

> [!NOTE]
> 该方法可用于全局资源、页面资源或远程资源。

`Crop` 方法依据给定的[处理规格](#处理规格)，从一张[processable image](g)（可处理的图像）返回新的资源。

> [!NOTE]
> 用 [`reflect.IsImageResourceProcessable`][] 函数判断图像是否可处理。

## 这一页解决什么问题

`Crop` 从一张可处理的图像里**按矩形区域截取一块**，返回一个新的资源。它**不缩放**：你写 `200x200`，就得到 200×200 的像素块，取哪一块由[锚点](#anchor)决定（默认取[成像配置][]里的 `anchor`）。

典型场景：卡片缩略图、头像框、把画面焦点固定在主体的局部截图。

## 什么时候用，什么时候别用

四个变换方法最容易混，先记住这一行：

| 方法 | 缩放？ | 裁剪？ | 会放大吗？ | 一句话 |
| --- | --- | --- | --- | --- |
| `Crop` | 否 | 是（按给定矩形取一块） | 不会 | 只裁不缩 |
| [`Fit`](/methods/resource/fit/) | 是（等比缩小） | 否 | **不会** | 缩到「装得进」为止 |
| [`Fill`](/methods/resource/fill/) | 是 | 是（裁掉溢出） | 会（为铺满而放大） | 缩放到铺满后裁掉多余 |
| [`Resize`](/methods/resource/resize/) | 是 | 否 | 会 | 直接缩到指定尺寸（可能变形） |

**该用**：只要局部、不想重采样（像素级还原）；目标尺寸固定且知道要保留哪个角。

**别用**：

- 想让整张图「装进」某个框 → `Fit`；
- 想「填满」某个框、允许裁边 → `Fill`；
- 只改尺寸不裁 → `Resize`；
- 还要转格式、旋转、调质量 → [`Process`](/methods/resource/process/) 一条规格字符串全包。

## 用法

裁剪时必须在规格中同时给出宽度和高度（例如 `200x200`）。该方法不做任何缩放，只是按给出的尺寸以及[锚点](#anchor)（如果有）截取图像的一个区域。

```go-html-template
{{ with resources.Get "images/original.jpg" }}
  {{ with .Crop "200x200 TopRight" }}
    <img src="{{ .RelPermalink }}" width="{{ .Width }}" height="{{ .Height }}" alt="">
  {{ end }}
{{ end }}
```

上面的示例中，`"200x200 TopRight"` 就是处理规格。

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
  {{ with .Crop "200x200 TopRight" }}
    <img src="{{ .RelPermalink }}" width="{{ .Width }}" height="{{ .Height }}" alt="">
  {{ end }}
{{ end }}
```

英文原文此处用示例照片演示 `crop 200x200 TopRight` 的前后对比效果；本站未收录该示例图。

## 完整示例（实测）

测量条件：Hugo 0.167.0 extended，Windows；`assets/images/original.jpg` 是一张 600×400 的 JPEG。把下面这段放进 `layouts/_default/single.html`：

```go-html-template {file="layouts/_default/single.html"}
{{ with resources.Get "images/original.jpg" }}
  {{ with .Crop "200x200 TopRight" }}
    <img src="{{ .RelPermalink }}" width="{{ .Width }}" height="{{ .Height }}" alt="">
  {{ end }}
{{ end }}
```

Hugo 渲染为：

```html
<img src="/images/original_hu_c40a25d8b29cdb3e.jpg" width="200" height="200" alt="">
```

**你应当看到什么**：宽高正是 200×200；URL 里的 `_hu_` 段是 Hugo 的缓存键（由源文件与处理规格算出），同一张图同一规格每次构建都一样，换图或换规格就会变。裁剪出来的文件同时被发布到 `public/images/`。

再试一个越界请求：源图只有 600×400，却要求 `1000x1000`：

```go-html-template
{{ with resources.Get "images/original.jpg" }}
  {{ with .Crop "1000x1000" }}宽 {{ .Width }}，高 {{ .Height }}{{ end }}
{{ end }}
```

实测输出：

```text
宽 400，高 400
```

**这里有个容易踩的坑**：越界**不会报错**，你拿到的是一个比请求尺寸小的图。`Crop` 不会放大图像，超出源图的部分自然取不到。要「放大到指定尺寸」，得用 `Resize` 或 `Fill`。

## 返回值边界（实测）

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| 规格正常（`200x200 TopRight`） | `images.ImageResource`，尺寸即所写 | 否 |
| 只写一个维度（`200x`、`x200`） | —— | 是：`error calling Crop: failed to crop image "…": must provide Width and Height` |
| 请求尺寸大于源图（`1000x1000`） | 返回源图范围内可取的尺寸（实测 400×400），**不放大** | 否 |
| 锚点拼错（`NoSuchAnchor`） | 实测仍返回 200×200，**不报错**；本页无法从输出判断它最终用了哪个锚点 | 否 |
| 对非图像资源调用 | —— | 是：`does not support this method: use reflect.IsImageResource…` |
| `resources.Get` 找不到文件（`nil`） | —— | 是：`nil pointer evaluating resource.Resource.Crop` |

写模板时可以先用 `reflect.IsImageResourceProcessable` 判断，再用 `with` 接住结果：

```go-html-template
{{ with resources.Get "images/original.jpg" }}
  {{ if reflect.IsImageResourceProcessable . }}
    {{ with .Crop "200x200 TopRight" }}
      <img src="{{ .RelPermalink }}" width="{{ .Width }}" height="{{ .Height }}" alt="">
    {{ end }}
  {{ else }}
    {{ errorf "无法处理这张图：%s" .RelPermalink }}
  {{ end }}
{{ end }}
```

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 没报错但结果不对 | 输出比预期小 | 请求尺寸超过源图，`Crop` 不放大 | 换 `Resize`/`Fill`，或把目标尺寸调小 |
| 没报错但结果不对 | 裁出来的位置不是想要的 | 锚点写错或没写（默认取成像配置的 `anchor`） | 显式写 `TopRight`、`Center`、`Smart` 等 |
| 报错看不懂 | `must provide Width and Height` | 裁剪必须同时给出宽和高 | 补成 `200x200`（不能只写 `200x`） |
| 构建失败 | `does not support this method` | 对文本等非图像资源用了 `Crop` | 先用 `reflect.IsImageResourceProcessable` 判断 |

更多排查入口见[故障排查](/troubleshooting/)。

[`Process`]: /methods/resource/process/
[`images.AutoOrient`]: /functions/images/autoorient/
[`images.Process`]: /functions/images/process/
[`muesli/smartcrop`]: https://github.com/muesli/smartcrop
[`reflect.IsImageResourceProcessable`]: /functions/reflect/isimageresourceprocessable/
[十六进制颜色]: https://developer.mozilla.org/en-US/docs/Web/CSS/hex-color
[成像配置]: /configuration/imaging/
[源文档]: https://github.com/disintegration/imaging#image-resizing
