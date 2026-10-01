+++
title = "images.UnsharpMask"
linkTitle = "UnsharpMask"
description = "返回一个锐化图像的图像滤镜。"
date = 2026-10-02
weight = 260
source = "https://gohugo.io/functions/images/unsharpmask/"

[params.functions_and_methods]
signatures = ["images.UnsharpMask SIGMA AMOUNT THRESHOLD"]
returnType = "images.filter"
+++

sigma 参数用于高斯函数，影响作用半径。sigma 必须为正数。锐化半径约为 sigma 值的 3 倍。

amount 参数控制边缘边界变暗和变亮的程度，通常在 0.5 到 1.5 之间。

threshold 参数控制会被锐化的最小亮度变化，通常在 0 到 0.05 之间。

## 用法

创建滤镜：

```go-html-template
{{ $filter := images.UnsharpMask 10 0.4 0.03 }}
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

英文原文此处用示例照片演示 `UnsharpMask 10 0.4 0.03` 的前后对比效果；本站未收录该示例图。

[`Filter`]: /methods/resource/filter/
[`images.Filter`]: /functions/images/filter/
