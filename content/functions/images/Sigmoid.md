+++
title = "images.Sigmoid"
linkTitle = "Sigmoid"
description = "返回一个用 S 形函数改变图像对比度的图像滤镜。"
date = 2026-10-02
weight = 240
source = "https://gohugo.io/functions/images/sigmoid/"

[params.functions_and_methods]
signatures = ["images.Sigmoid MIDPOINT FACTOR"]
returnType = "images.filter"
+++

这是一种非线性对比度调整，适合用于照片修饰；它保留了高光和阴影的细节。

midpoint 是对比度的中点，必须在 `[0, 1]` 区间内，通常取 `0.5`。

factor 表示提高或降低对比度的程度，通常在 `[-10, 10]` 区间内，其中 0 表示不产生任何效果。正值提高对比度，负值降低对比度。

## 用法

创建滤镜：

```go-html-template
{{ $filter := images.Sigmoid 0.6 -4 }}
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

英文原文此处用示例照片演示 `Sigmoid 0.6 -4` 的前后对比效果；本站未收录该示例图。

[`Filter`]: /methods/resource/filter/
[`images.Filter`]: /functions/images/filter/
