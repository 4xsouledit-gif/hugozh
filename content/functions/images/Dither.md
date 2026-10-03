+++
title = "images.Dither"
linkTitle = "Dither"
description = "返回一个对图像做抖动（dither）处理的图像滤镜。"
date = 2026-10-02
weight = 80
source = "https://gohugo.io/functions/images/dither/"

[params.functions_and_methods]
signatures = ["images.Dither [OPTIONS]"]
returnType = "images.filter"
+++

## 选项

`images.Dither` 滤镜接受一个选项映射（map）。

`colors`
: （`[]string`）构成抖动调色板的两种或更多颜色组成的切片，每种颜色用 RGB 或 RGBA 的[十六进制][]值表示，可以带或不带前导井号。默认值是不透明黑（`000000ff`）和不透明白（`ffffffff`）。

`method`
: （`string`）抖动方法。可用方法见下文[抖动方法](#dithering-methods)一节。默认为 `FloydSteinberg`。

`serpentine`
: （`bool`）仅适用于误差扩散类抖动方法：是否以蛇形（serpentine）方式应用误差扩散矩阵，即每隔一行改为从右到左。这能大幅减少线状伪影。默认为 `true`。

`strength`
: （`float`）应用抖动矩阵的强度，通常取值在 `[0, 1]` 区间内。取值 `1.0` 表示以 100% 强度应用抖动矩阵（不修改抖动矩阵）。`strength` 与对比度成反比：降低强度会提高对比度。把 `strength` 设为 `0.8` 之类的值有助于减少抖动图像中的噪点。默认为 `1.0`。

## 用法

创建选项映射：

```go-html-template
{{ $opts := dict
  "colors" (slice "222222" "808080" "dddddd")
  "method" "ClusteredDot4x4"
  "strength" 0.85
}}
```

创建滤镜：

```go-html-template
{{ $filter := images.Dither $opts }}
```

或者使用默认设置创建滤镜：

```go-html-template
{{ $filter := images.Dither }}
```

用 [`images.Filter`][] 函数应用该滤镜：

```go-html-template
{{ with resources.Get "images/original.jpg" }}
  {{ with . | images.Filter $filter }}
    <img src="{{ .RelPermalink }}" width="{{ .Width }}" height="{{ .Height }}" alt="">
  {{ end }}
{{ end }}
```

也可以在 `Resource` 对象上调用 [`Filter`][] 方法应用该滤镜：

```go-html-template
{{ with resources.Get "images/original.jpg" }}
  {{ with .Filter $filter }}
    <img src="{{ .RelPermalink }}" width="{{ .Width }}" height="{{ .Height }}" alt="">
  {{ end }}
{{ end }}
```

## 抖动方法

各抖动方法的说明见 [Go 文档][]。

误差扩散类抖动方法：

- Atkinson
- Burkes
- FalseFloydSteinberg
- FloydSteinberg
- JarvisJudiceNinke
- Sierra
- Sierra2
- Sierra2_4A
- Sierra3
- SierraLite
- Simple2D
- StevenPigeon
- Stucki
- TwoRowSierra

有序抖动方法：

- ClusteredDot4x4
- ClusteredDot6x6
- ClusteredDot6x6_2
- ClusteredDot6x6_3
- ClusteredDot8x8
- ClusteredDotDiagonal16x16
- ClusteredDotDiagonal6x6
- ClusteredDotDiagonal8x8
- ClusteredDotDiagonal8x8_2
- ClusteredDotDiagonal8x8_3
- ClusteredDotHorizontalLine
- ClusteredDotSpiral5x5
- ClusteredDotVerticalLine
- Horizontal3x5
- Vertical5x3

## 示例

此示例使用默认的抖动选项。

英文原文此处用示例照片演示默认抖动选项的前后对比效果；本站未收录该示例图。

## 建议

无论采用哪种抖动方法，想要获得最佳效果都应做到以下两点：

1. 在抖动*之前*先缩放图像
1. 把图像输出为 GIF 或 PNG 等无损格式

下面的示例同时做到了这两点，并把抖动调色板设为图像中占比最高的三种颜色。

```go-html-template
{{ with resources.Get "original.jpg" }}
  {{ $opts := dict
    "method" "ClusteredDotSpiral5x5"
    "colors" (first 3 .Colors)
  }}
  {{ $filters := slice
    (images.Process "resize 800x")
    (images.Dither $opts)
    (images.Process "png")
  }}
  {{ with . | images.Filter $filters }}
    <img src="{{ .RelPermalink }}" width="{{ .Width }}" height="{{ .Height }}" alt="">
  {{ end }}
{{ end }}
```

若抖动调色板是灰度的，为获得最佳效果应先把图像转换为灰度再抖动。

```go-html-template
{{ $opts := dict "colors" (slice "222" "808080" "ddd") }}
{{ $filters := slice
  (images.Process "resize 800x")
  (images.Grayscale)
  (images.Dither $opts)
  (images.Process "png")
}}
{{ with images.Filter $filters . }}
  <img src="{{ .RelPermalink }}" width="{{ .Width }}" height="{{ .Height }}" alt="">
{{ end }}
```

上面的示例：

1. 把图像缩放到 800 px 宽
1. 把图像转换为灰度
1. 用默认（`FloydSteinberg`）抖动方法和灰度调色板对图像做抖动
1. 把图像转换为 PNG 格式

[Go 文档]: https://pkg.go.dev/github.com/makeworld-the-better-one/dither/v2#pkg-variables
[十六进制]: https://developer.mozilla.org/en-US/docs/Web/CSS/hex-color
[`Filter`]: /methods/resource/filter/
[`images.Filter`]: /functions/images/filter/
