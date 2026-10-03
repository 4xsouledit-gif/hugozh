+++
title = "images.Brightness"
linkTitle = "Brightness"
description = "返回一个改变图像亮度的图像滤镜。"
date = 2026-10-02
weight = 30
source = "https://gohugo.io/functions/images/brightness/"

[params.functions_and_methods]
signatures = ["images.Brightness PERCENTAGE"]
returnType = "images.filter"
+++

百分比的取值范围是 `[-100, 100]`，其中 `0` 表示不产生任何效果。取值 `-100` 得到纯黑图像，取值 `100` 得到纯白图像。

## 用法

创建图像滤镜：

```go-html-template
{{ $filter := images.Brightness 12 }}
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

英文原文此处用示例照片演示 `Brightness 12` 的前后对比效果；本站未收录该示例图。

[`Filter`]: /methods/resource/filter/
[`images.Filter`]: /functions/images/filter/
