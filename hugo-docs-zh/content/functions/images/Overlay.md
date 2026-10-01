+++
title = "images.Overlay"
linkTitle = "Overlay"
description = "返回一个把源图像叠加到指定坐标（相对左上角）的图像滤镜。"
date = 2026-10-02
weight = 170
source = "https://gohugo.io/functions/images/overlay/"

[params.functions_and_methods]
signatures = ["images.Overlay RESOURCE X Y"]
returnType = "images.filter"
+++

## 用法

把叠加图像捕获为资源：

```go-html-template
{{ $overlay := "" }}
{{ $path := "images/logo.png" }}
{{ with resources.Get $path }}
  {{ $overlay = . }}
{{ else }}
  {{ errorf "Unable to get resource %q" $path }}
{{ end }}
```

叠加图像可以是全局资源、页面资源或远程资源。

创建滤镜：

```go-html-template
{{ $filter := images.Overlay $overlay 20 20 }}
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

英文原文此处用示例照片演示把 logo 叠加到坐标 `20,20` 处的前后对比效果；本站未收录该示例图。

[`Filter`]: /methods/resource/filter/
[`images.Filter`]: /functions/images/filter/
