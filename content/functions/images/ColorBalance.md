+++
title = "images.ColorBalance"
linkTitle = "ColorBalance"
description = "返回一个改变图像色彩平衡的图像滤镜。"
date = 2026-10-02
weight = 40
source = "https://gohugo.io/functions/images/colorbalance/"

[params.functions_and_methods]
signatures = ["images.ColorBalance PCTRED PCTGREEN PCTBLUE"]
returnType = "images.filter"
+++

每个通道（红、绿、蓝）的百分比取值范围是 `[-100, 500]`。

## 用法

创建滤镜：

```go-html-template
{{ $filter := images.ColorBalance -10 10 50 }}
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

英文原文此处用示例照片演示 `ColorBalance -10 10 50` 的前后对比效果；本站未收录该示例图。

[`Filter`]: /methods/resource/filter/
[`images.Filter`]: /functions/images/filter/
