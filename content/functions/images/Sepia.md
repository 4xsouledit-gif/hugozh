+++
title = "images.Sepia"
linkTitle = "Sepia"
description = "返回一个生成图像棕褐色（sepia）版本的图像滤镜。"
date = 2026-10-02
weight = 230
source = "https://gohugo.io/functions/images/sepia/"

[params.functions_and_methods]
signatures = ["images.Sepia PERCENTAGE"]
returnType = "images.filter"
+++

百分比的取值范围是 `[0, 100]`，其中 `0` 表示不产生任何效果。

## 用法

创建滤镜：

```go-html-template
{{ $filter := images.Sepia 75 }}
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

英文原文此处用示例照片演示 `Sepia 75` 的前后对比效果；本站未收录该示例图。

[`Filter`]: /methods/resource/filter/
[`images.Filter`]: /functions/images/filter/
