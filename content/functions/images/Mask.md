+++
title = "images.Mask"
linkTitle = "Mask"
description = "返回一个对源图像应用遮罩的图像滤镜。"
date = 2026-10-02
weight = 150
source = "https://gohugo.io/functions/images/mask/"

[params.functions_and_methods]
signatures = ["images.Mask RESOURCE"]
returnType = "images.filter"
+++

**（0.141.0 新增）**

`images.Mask` 滤镜对图像应用遮罩。遮罩中的黑色像素使基础图像对应区域变为透明，白色像素则保持不透明。彩色图像会先转换为灰度再用于遮罩。遮罩会自动缩放以匹配基础图像的尺寸。

> [!NOTE]
> 在 Hugo 图像管线支持的格式中，只有 AVIF、PNG 和 WebP 具备支持透明度的 alpha 通道。若源图是其他格式，而又需要遮罩区域透明，请按下例先把它转换为 AVIF、PNG 或 WebP。

对 JPEG 之类不支持透明度的格式应用遮罩时，遮罩区域会填充为[项目配置][]中 `bgColor` 参数指定的颜色。可以用 `Process` 图像滤镜覆盖该颜色：

```go-html-template
{{ $filter := images.Process "#00ff00" }}
```

## 用法

创建一个滤镜切片，其中一个负责格式转换，另一个负责应用遮罩：

```go-html-template
{{ $filter1 := images.Process "webp" }}
{{ $filter2 := images.Mask (resources.Get "images/mask.png") }}
{{ $filters := slice $filter1 $filter2 }}
```

用 [`images.Filter`][] 函数应用这些滤镜：

```go-html-template
{{ with resources.Get "images/original.jpg" }}
  {{ with . | images.Filter $filters }}
    <img src="{{ .RelPermalink }}" width="{{ .Width }}" height="{{ .Height }}" alt="">
  {{ end }}
{{ end }}
```

也可以在 `Resource` 对象上调用 [`Filter`][] 方法应用该滤镜：

```go-html-template
{{ with resources.Get "images/original.jpg" }}
  {{ with .Filter $filters }}
    <img src="{{ .RelPermalink }}" width="{{ .Width }}" height="{{ .Height }}" alt="">
  {{ end }}
{{ end }}
```

## 示例

遮罩：

英文原文此处展示一张遮罩图像（`images/examples/mask.png`）。

英文原文此处再用示例照片演示应用 `mask` 滤镜的前后对比效果；本站未收录这两张示例图。

[`Filter`]: /methods/resource/filter/
[`images.Filter`]: /functions/images/filter/
[项目配置]: /configuration/imaging/
