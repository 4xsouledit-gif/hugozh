+++
title = "images.AutoOrient"
linkTitle = "AutoOrient"
description = "返回一个图像滤镜，按图像的 Exif 方向标记自动旋转和翻转图像。"
date = 2026-10-02
weight = 20
source = "https://gohugo.io/functions/images/autoorient/"

[params.functions_and_methods]
signatures = ["images.AutoOrient"]
returnType = "images.filter"
+++

## 用法

创建滤镜：

```go-html-template
{{ $filter := images.AutoOrient }}
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

> [!NOTE]
> 与其他滤镜一起使用时，把 `images.AutoOrient` 放在最前面。

```go-html-template
{{ $filters := slice
  images.AutoOrient
  (images.Process "resize 200x")
}}
{{ with resources.Get "images/original.jpg" }}
  {{ with images.Filter $filters . }}
    <img src="{{ .RelPermalink }}" width="{{ .Width }}" height="{{ .Height }}" alt="">
  {{ end }}
{{ end }}
```

## 示例

英文原文此处用一张带 Exif 方向标记的示例照片演示 `AutoOrient` 的前后对比效果；本站未收录该示例图。

[`Filter`]: /methods/resource/filter/
[`images.Filter`]: /functions/images/filter/
