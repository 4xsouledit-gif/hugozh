+++
title = "images.Grayscale"
linkTitle = "Grayscale"
description = "返回一个生成图像灰度版本的图像滤镜。"
date = 2026-10-02
weight = 120
source = "https://gohugo.io/functions/images/grayscale/"

[params.functions_and_methods]
signatures = ["images.Grayscale"]
returnType = "images.filter"
+++

## 用法

创建滤镜：

```go-html-template
{{ $filter := images.Grayscale }}
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

英文原文此处用示例照片演示 `Grayscale` 滤镜的前后对比效果；本站未收录该示例图。

[`Filter`]: /methods/resource/filter/
[`images.Filter`]: /functions/images/filter/
