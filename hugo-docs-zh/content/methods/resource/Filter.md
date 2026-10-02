+++
title = "Filter"
linkTitle = "Filter"
description = "返回应用了一个或多个图像滤镜后的新图像资源。"
date = 2026-10-02
weight = 80
source = "https://gohugo.io/methods/resource/filter/"

[params.functions_and_methods]
signatures = ["RESOURCE.Filter FILTER..."]
returnType = "images.ImageResource"
+++

> [!NOTE]
> 该方法可用于全局资源、页面资源或远程资源。

`Filter` 方法对一张[processable image](g)（可处理的图像）应用一个或多个[图像滤镜](#图像滤镜)后返回新的资源。

> [!NOTE]
> 用 [`reflect.IsImageResourceProcessable`][] 函数判断图像是否可处理。

## 这一页解决什么问题

`Filter` 解决「**在不改尺寸的前提下改变画面的样子**」：灰度、模糊、锐化、像素化、叠色、加水印文字都算滤镜。它接收一个滤镜，也接收滤镜切片（按从左到右依次应用），返回一个新图像资源。

典型场景：给文章配图统一做去色处理、给头像加圆角/遮罩、给截图打码（`images.Pixelate`）、给封面图叠标题文字（`images.Text`）。

## 什么时候用，什么时候别用

**该用**：

- 视觉效果的叠加，且**尺寸不变**（滤镜本身不改宽高，实测传入 `Grayscale` 前后都是 600×400）；
- 多个效果串联：`slice` 里按顺序放滤镜，如先 `Grayscale` 再 `GaussianBlur`；
- 与变换组合：先 `Resize` 再 `Filter`（或反过来），把结果继续当普通资源用。

**别用**：

- 只想改尺寸 → [`Resize`](/methods/resource/resize/) / [`Fit`](/methods/resource/fit/) / [`Fill`](/methods/resource/fill/) / [`Crop`](/methods/resource/crop/)；
- 要旋转、转格式、调质量 → [`Process`](/methods/resource/process/)；`Filter` 只负责像素效果，`images.Process` 滤镜可以把整套变换塞进滤镜链；
- 需要在管道里一次性串联多个图像操作 → 用 [`images.Filter`](/functions/images/filter/) 函数，写法更顺手。

## 用法

用 `Filter` 方法应用模糊、锐化、灰度转换等效果。可以传入单个滤镜，也可以传入滤镜切片。传入切片时，Hugo 从左到右依次应用这些滤镜。

应用单个滤镜：

```go-html-template
{{ with resources.Get "images/original.jpg" }}
  {{ with .Filter images.Grayscale }}
    <img src="{{ .RelPermalink }}" width="{{ .Width }}" height="{{ .Height }}" alt="">
  {{ end }}
{{ end }}
```

应用多个滤镜：

```go-html-template
{{ $filters := slice
  images.Grayscale
  (images.GaussianBlur 8)
}}
{{ with resources.Get "images/original.jpg" }}
  {{ with .Filter $filters }}
    <img src="{{ .RelPermalink }}" width="{{ .Width }}" height="{{ .Height }}" alt="">
  {{ end }}
{{ end }}
```

也可以用 [`images.Filter`][] 函数应用图像滤镜。

## 示例

```go-html-template
{{ with resources.Get "images/original.jpg" }}
  {{ with .Filter images.Grayscale }}
    <img src="{{ .RelPermalink }}" width="{{ .Width }}" height="{{ .Height }}" alt="">
  {{ end }}
{{ end }}
```

英文原文此处用示例照片演示 `Grayscale` 滤镜的前后对比效果；本站未收录该示例图。

## 图像滤镜

以下滤镜都可以配合 `Filter` 方法使用。

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

## 完整示例（实测）

测量条件：Hugo 0.167.0 extended，Windows；`assets/images/original.jpg` 是一张 600×400 的 JPEG。放进 `layouts/_default/single.html`：

```go-html-template {file="layouts/_default/single.html"}
{{ $filters := slice
  images.Grayscale
  (images.GaussianBlur 8)
}}
{{ with resources.Get "images/original.jpg" }}
  {{ with .Filter images.Grayscale }}
    <p>单滤镜：{{ .RelPermalink }} {{ .Width }}x{{ .Height }}</p>
  {{ end }}
  {{ with .Filter $filters }}
    <p>双滤镜：{{ .RelPermalink }} {{ .Width }}x{{ .Height }}</p>
  {{ end }}
{{ end }}
```

Hugo 渲染为：

```html
<p>单滤镜：/images/original_hu_e9cc708b5d920c7d.jpg 600x400</p>
<p>双滤镜：/images/original_hu_31ead45f613460c3.jpg 600x400</p>
```

**你应当看到什么**：

- 两个 URL 不同（滤镜链不同 → 缓存键不同），但**宽高与源图完全一致**——滤镜不改尺寸；
- 单滤镜 URL 与双滤镜 URL 的哈希不同，说明「同一个滤镜链」才会命中同一份缓存：把 `GaussianBlur` 的 8 改成 6，就会生成第三个文件。

滤镜拼错时的实测行为：

```text
{{ .Filter "not-a-filter" }}
→ error calling Filter: string is not an image filter
```

## 返回值边界（实测）

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| 单个滤镜（`images.Grayscale`） | `images.ImageResource`，宽高不变 | 否 |
| 滤镜切片 | 按从左到右应用，宽高不变 | 否 |
| 传空切片 `slice` | 未实测（上游未说明）；不传滤镜时改用原资源更清楚 | —— |
| 传字符串而不是滤镜 | —— | 是：`error calling Filter: string is not an image filter` |
| 图像本身不支持 alpha 而滤镜需要 | 由具体滤镜决定，未实测 | —— |
| 对非图像资源调用 | —— | 是：`does not support this method: use reflect.IsImageResource…` |
| `resources.Get` 找不到文件（`nil`） | —— | 是：`nil pointer evaluating resource.Resource.Filter` |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 报错看不懂 | `string is not an image filter` | 把滤镜名写成了字符串（`"images.Grayscale"`） | 写函数调用本身：`images.Grayscale`，带参数的要加括号 `(images.GaussianBlur 8)` |
| 没报错但结果不对 | 生成了一堆内容相同的图片 | 滤镜链稍有不同就是另一个缓存键 | 把滤镜链提取成 `$filters` 变量，全站复用 |
| 没报错但结果不对 | 想改尺寸却发现尺寸没变 | `Filter` 只做像素效果 | 尺寸交给 `Resize`/`Fit`/`Fill`/`Crop` |
| 构建失败 | `does not support this method` | 对文本等非图像资源用了 `Filter` | 先用 `reflect.IsImageResourceProcessable` 判断 |

更多排查入口见[故障排查](/troubleshooting/)。

[`images.Filter`]: /functions/images/filter/
[`reflect.IsImageResourceProcessable`]: /functions/reflect/isimageresourceprocessable/
