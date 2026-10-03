+++
title = "images.Opacity"
linkTitle = "Opacity"
description = "返回一个改变图像不透明度的图像滤镜。"
date = 2026-10-02
weight = 160
source = "https://gohugo.io/functions/images/opacity/"

[params.functions_and_methods]
signatures = ["images.Opacity OPACITY"]
returnType = "images.filter"
+++

不透明度（opacity）的取值范围是 `[0, 1]`。取值 `0` 得到完全透明的图像，取值 `1` 得到完全不透明的图像（没有透明度）。

## 用法

创建滤镜：

```go-html-template
{{ $filter := images.Opacity 0.65 }}
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

`images.Opacity` 滤镜对 AVIF、PNG、WebP 等支持透明度的目标格式最有用。若源图不支持透明度，请把该滤镜与 `images.Process` 滤镜组合使用：

```go-html-template
{{ with resources.Get "images/original.jpg" }}
  {{ $filters := slice
    (images.Opacity 0.65)
    (images.Process "png")
  }}
  {{ with . | images.Filter $filters }}
    <img src="{{ .RelPermalink }}" width="{{ .Width }}" height="{{ .Height }}" alt="">
  {{ end }}
{{ end }}
```

## 示例

英文原文此处用示例照片演示 `Opacity 0.65` 的前后对比效果；本站未收录该示例图。

[`Filter`]: /methods/resource/filter/
[`images.Filter`]: /functions/images/filter/
