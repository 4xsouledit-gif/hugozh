+++
title = "images.Hue"
linkTitle = "Hue"
description = "返回一个旋转图像色相的图像滤镜。"
date = 2026-10-02
weight = 130
source = "https://gohugo.io/functions/images/hue/"

[params.functions_and_methods]
signatures = ["images.Hue SHIFT"]
returnType = "images.filter"
+++

色相角度的偏移量通常在 `[-180, 180]` 区间内，其中 `0` 表示不产生任何效果。

## 用法

创建滤镜：

```go-html-template
{{ $filter := images.Hue -15 }}
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

英文原文此处用示例照片演示 `Hue -15` 的前后对比效果；本站未收录该示例图。

[`Filter`]: /methods/resource/filter/
[`images.Filter`]: /functions/images/filter/
