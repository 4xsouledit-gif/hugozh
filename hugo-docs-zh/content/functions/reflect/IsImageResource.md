+++
title = "reflect.IsImageResource"
linkTitle = "IsImageResource"
description = "报告给定值是否为资源（Resource）对象，且按其媒体类型判断它表示一张图像。"
date = 2026-10-02
weight = 20
source = "https://gohugo.io/functions/reflect/isimageresource/"

[params.functions_and_methods]
signatures = ["reflect.IsImageResource INPUT"]
returnType = "bool"
+++

**（0.154.0 新增）**

## 用法

下例遍历项目的全部资源，用 `reflect.IsImageResource` 决定是渲染 `img` 标签，还是为非图像文件给出下载链接。

```go-html-template
{{ range resources.Match "**" }}
  {{ if reflect.IsImageResource . }}
    <img src="{{ .RelPermalink }}" alt="Image">
  {{ else }}
    <a href="{{ .RelPermalink }}">Download</a>
  {{ end }}
{{ end }}
```

## 图像操作

用这些函数判断 Hugo 对给定资源支持哪些操作。Hugo 会把多种文件类型都归类为图像资源，但能否处理它们、能否提取元数据，则取决于具体格式。

- [`reflect.IsImageResource`][]：报告给定值是否为资源（Resource）对象，且按其媒体类型判断它表示一张图像。
- [`reflect.IsImageResourceProcessable`][]：报告给定值是否为资源（Resource）对象，且表示一张 Hugo 能提取尺寸并处理的图像——例如转换、缩放、裁剪或应用滤镜。
- [`reflect.IsImageResourceWithMeta`][]：报告给定值是否为资源（Resource）对象，且表示一张 Hugo 能提取尺寸、并在存在时提取 Exif、IPTC 与 XMP 数据的图像。

下表给出这些函数对各种文件格式的返回值。可以据此判断在模板中调用具体方法之前需要先做哪些检查。

|格式|IsImageResource|IsImageResourceProcessable|IsImageResourceWithMeta|
|:-----|:--------------|:-------------------------|:----------------------|
|AVIF  |true           |true                      |true                   |
|BMP   |true           |true                      |true                   |
|GIF   |true           |true                      |true                   |
|HEIC  |true           |**false**                 |true                   |
|HEIF  |true           |**false**                 |true                   |
|ICO   |true           |**false**                 |**false**              |
|JPEG  |true           |true                      |true                   |
|PNG   |true           |true                      |true                   |
|SVG   |true           |**false**                 |**false**              |
|TIFF  |true           |true                      |true                   |
|WebP  |true           |true                      |true                   |

下面这个刻意构造的例子演示如何遍历资源，并借助这些函数为每种图像格式选择恰当的处理方式。

```go-html-template
{{ range resources.Match "**" }}
  {{ if reflect.IsImageResource . }}
    {{ if reflect.IsImageResourceProcessable . }}
      {{ with .Process "resize 300x webp" }}
        <img src="{{ .RelPermalink }}" width="{{ .Width }}" height="{{ .Height }}" alt="">
      {{ end }}
    {{ else if reflect.IsImageResourceWithMeta . }}
      <img src="{{ .RelPermalink }}" width="{{ .Width }}" height="{{ .Height }}" alt="">
    {{ else }}
      <img src="{{ .RelPermalink }}" alt="">
    {{ end }}
  {{ end }}
{{ end }}
```

[`reflect.IsImageResourceProcessable`]: /functions/reflect/isimageresourceprocessable/
[`reflect.IsImageResourceWithMeta`]: /functions/reflect/isimageresourcewithmeta/
[`reflect.IsImageResource`]: /functions/reflect/isimageresource/
