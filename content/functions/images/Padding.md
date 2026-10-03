+++
title = "images.Padding"
linkTitle = "Padding"
description = "返回一个只改变图像画布尺寸、不缩放图像本身的图像滤镜。"
date = 2026-10-02
weight = 180
source = "https://gohugo.io/functions/images/padding/"

[params.functions_and_methods]
signatures = ["images.Padding V1 [V2] [V3] [V4] [COLOR]"]
returnType = "images.filter"
+++

最后一个参数是画布颜色，用 RGB 或 RGBA [十六进制颜色][]表示。默认值为 `ffffffff`（不透明白）。它前面的参数是内边距（padding）值，单位为像素，采用 CSS [简写属性][]语法。内边距取负值会裁剪图像。

## 用法

创建滤镜：

```go-html-template
{{ $filter := images.Padding 20 40 "#976941" }}
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

与 [`Colors`][] 方法结合，可以用图像中占比最高的颜色之一生成边框：

```go-html-template
{{ with resources.Get "images/original.jpg" }}
  {{ $filter := images.Padding 20 40 (index .Colors 2) }}
  {{ with . | images.Filter $filter }}
    <img src="{{ .RelPermalink }}" width="{{ .Width }}" height="{{ .Height }}" alt="">
  {{ end }}
{{ end }}
```

## 示例

英文原文此处用示例照片演示 `Padding 20,40,20,40,#976941` 的前后对比效果；本站未收录该示例图。

## 其他配方

下面的示例把图像缩放到 300px 宽、转换为 WebP 格式、添加上下各 20px 与左右各 50px 的内边距，然后把画布颜色设为不透明度 33% 的深绿色。

下例中必须转换为 WebP 才能支持透明度。AVIF、PNG、WebP 图像带 alpha 通道；JPEG 和 GIF 没有。

```go-html-template
{{ $img := resources.Get "images/a.jpg" }}
{{ $filters := slice
  (images.Process "resize 300x webp")
  (images.Padding 20 50 "#0705")
}}
{{ $img = $img.Filter $filters }}
```

给图像添加 2px 灰色边框：

```go-html-template
{{ $img = $img.Filter (images.Padding 2 "#777") }}
```

[`Colors`]: /methods/resource/colors/
[`Filter`]: /methods/resource/filter/
[`images.Filter`]: /functions/images/filter/
[十六进制颜色]: https://developer.mozilla.org/en-US/docs/Web/CSS/hex-color
[简写属性]: https://developer.mozilla.org/en-US/docs/Web/CSS/Shorthand_properties#edges_of_a_box
