+++
title = "images.Pixelate"
linkTitle = "Pixelate"
description = "返回一个对图像做像素化（pixelate）处理的图像滤镜。"
date = 2026-10-02
weight = 190
source = "https://gohugo.io/functions/images/pixelate/"

[params.functions_and_methods]
signatures = ["images.Pixelate SIZE"]
returnType = "images.filter"
+++

## 用法

创建滤镜：

```go-html-template
{{ $filter := images.Pixelate 4 }}
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

英文原文此处用示例照片演示 `Pixelate 4` 的前后对比效果；本站未收录该示例图。

[`Filter`]: /methods/resource/filter/
[`images.Filter`]: /functions/images/filter/
