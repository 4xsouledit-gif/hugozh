+++
title = "images.Gamma"
linkTitle = "Gamma"
description = "返回一个对图像做伽马校正的图像滤镜。"
date = 2026-10-02
weight = 100
source = "https://gohugo.io/functions/images/gamma/"

[params.functions_and_methods]
signatures = ["images.Gamma GAMMA"]
returnType = "images.filter"
+++

伽马值必须为正数。大于 1 的值会让图像变亮，小于 1 的值会让图像变暗。伽马值为&nbsp;1 时该滤镜不产生任何效果。

## 用法

创建滤镜：

```go-html-template
{{ $filter := images.Gamma 1.667 }}
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

英文原文此处用示例照片演示 `Gamma 1.667` 的前后对比效果；本站未收录该示例图。

[`Filter`]: /methods/resource/filter/
[`images.Filter`]: /functions/images/filter/
