+++
title = "images.Colorize"
linkTitle = "Colorize"
description = "返回一个生成图像着色版本的图像滤镜。"
date = 2026-10-02
weight = 50
source = "https://gohugo.io/functions/images/colorize/"

[params.functions_and_methods]
signatures = ["images.Colorize HUE SATURATION PERCENTAGE"]
returnType = "images.filter"
+++

色相是色轮上的角度，取值范围通常是 `[0, 360]`。

饱和度必须在 `[0, 100]` 区间内。

百分比指定效果的强度，必须在 `[0, 100]` 区间内。

## 用法

创建滤镜：

```go-html-template
{{ $filter := images.Colorize 180 50 20 }}
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

英文原文此处用示例照片演示 `Colorize 180 50 20` 的前后对比效果；本站未收录该示例图。

[`Filter`]: /methods/resource/filter/
[`images.Filter`]: /functions/images/filter/
