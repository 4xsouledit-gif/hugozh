+++
title = "images.GaussianBlur"
linkTitle = "GaussianBlur"
description = "返回一个对图像做高斯模糊的图像滤镜。"
date = 2026-10-02
weight = 110
source = "https://gohugo.io/functions/images/gaussianblur/"

[params.functions_and_methods]
signatures = ["images.GaussianBlur SIGMA"]
returnType = "images.filter"
+++

sigma 值必须为正数，它表示图像被模糊的程度。受模糊影响的半径约为 sigma 值的 3 倍。

## 用法

创建滤镜：

```go-html-template
{{ $filter := images.GaussianBlur 5 }}
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

## 示例

英文原文此处用示例照片演示 `GaussianBlur 5` 的前后对比效果；本站未收录该示例图。

[`Filter`]: /methods/resource/filter/
[`images.Filter`]: /functions/images/filter/
