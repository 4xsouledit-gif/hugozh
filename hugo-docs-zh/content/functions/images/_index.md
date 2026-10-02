+++
title = "图像函数"
linkTitle = "images"
description = "创建图像滤镜、把滤镜链应用到图片上，以及读取图像信息：亮度、对比度、色彩、模糊、遮罩、叠加、二维码等。"
date = 2026-10-02
weight = 140
source = "https://gohugo.io/functions/images/"

[params.teach]
difficulty = "进阶"
time = "按需查阅；动手约 30 分钟"
prereq = [
  "站点里已经有图片资源（放在页面包里或 `assets/` 下），并且你知道用 `resources.Get` 或页面资源方法把它们取出来。",
  "读过[图像处理](/content-management/image-processing/)的总览——本组是那里的细分参考。",
]
outcomes = [
  "分清本组的三种角色：**生成滤镜**（如 `images.Brightness`）、**应用滤镜**（`images.Filter`）、**读信息**（`images.Config` / `images.QR`）；",
  "把多个滤镜串成一条链应用到图片上，并理解滤镜的**应用顺序**会影响结果；",
  "知道滤镜只作用于**图像资源**，缩放裁剪那类几何操作属于 `Resource` 上的方法（`.Resize` / `.Fill` / `.Fit` / `.Crop`）；",
  "遇到「滤镜没效果」时，先确认拿到的确实是图像资源（而不是普通文件），再用 `debug.Dump` 看资源类型。",
]
next = ["/content-management/image-processing/", "/functions/images/filter/", "/methods/resource/resize/"]
+++

## 这一组的三种角色

先把角色分清，用起来就不会乱：

| 角色 | 代表 | 说明 |
| --- | --- | --- |
| **生成滤镜** | [`Brightness`](/functions/images/brightness/)、[`Contrast`](/functions/images/contrast/)、[`GaussianBlur`](/functions/images/gaussianblur/)、[`Grayscale`](/functions/images/grayscale/)、[`Sepia`](/functions/images/sepia/)、[`Colorize`](/functions/images/colorize/)、[`Hue`](/functions/images/hue/)、[`Saturation`](/functions/images/saturation/)、[`Gamma`](/functions/images/gamma/)、[`Sigmoid`](/functions/images/sigmoid/)、[`Pixelate`](/functions/images/pixelate/)、[`Dither`](/functions/images/dither/)、[`Invert`](/functions/images/invert/)、[`Opacity`](/functions/images/opacity/)、[`ColorBalance`](/functions/images/colorbalance/)、[`UnsharpMask`](/functions/images/unsharpmask/)、[`AutoOrient`](/functions/images/autoorient/)、[`Padding`](/functions/images/padding/)、[`Text`](/functions/images/text/)、[`Overlay`](/functions/images/overlay/)、[`Mask`](/functions/images/mask/)、[`Process`](/functions/images/process/) | 本身**不处理图片**，只是产出一个「滤镜值」 |
| **应用滤镜** | [`Filter`](/functions/images/filter/) | 把一个或多个滤镜作用到图像资源上，返回**新的图像资源** |
| **读信息 / 生成** | [`Config`](/functions/images/config/)、[`QR`](/functions/images/qr/) | 读图像配置；按文本生成二维码图片 |

## 典型用法

滤镜必须通过 `images.Filter` 应用，单独调用不会产生任何效果：

```go-html-template
{{ with resources.Get "images/photo.jpg" }}
  {{ $filters := slice
    (images.Grayscale)
    (images.Contrast 20)
    (images.GaussianBlur 2)
  }}
  {{ $img := .Filter $filters }}
  <img src="{{ $img.RelPermalink }}" width="{{ $img.Width }}" height="{{ $img.Height }}" alt="">
{{ end }}
```

**顺序有意义**：先灰度再提对比度，和先提对比度再灰度，结果不同——按你想要的视觉流程排列。

## 什么时候用、什么时候别用

- **用**：需要在**构建期**批量统一图片风格（水印、去色、统一亮度），产物是一次性生成好的静态文件；
- **别用**：旋转、缩放、裁剪、改格式 → 那些是 `Resource` 的方法（[`.Resize`](/methods/resource/resize/)、`.Fill`、`.Fit`、`.Crop`、`.Process`），不属于本组；
- **代价**：每个滤镜都会产生一份新的派生图片文件，**滤镜数量 × 图片数量**会显著增加构建时间与产物体积，先用少量图片量一下再全量铺开。

完整的处理流程（取资源 → 处理 → 输出、缓存与指纹）见[图像处理](/content-management/image-processing/)。

下方列出本站收录的本组全部函数。
