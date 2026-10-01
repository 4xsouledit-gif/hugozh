+++
title = "Meta"
linkTitle = "Meta"
description = "返回图像的 Exif、IPTC 与 XMP 元数据（格式支持时）。"
date = 2026-10-02
weight = 120
source = "https://gohugo.io/methods/resource/meta/"

[params.functions_and_methods]
signatures = ["RESOURCE.Meta"]
returnType = "meta.MetaInfo"
+++

**（0.155.3 新增）**

> [!NOTE]
> 该方法可用于全局资源、页面资源或远程资源。

图像 `Resource` 对象上的 `Meta` 方法返回一个对象，其中包含 [Exif][]、[IPTC][] 与 [XMP][] 元数据。

Hugo 会把许多文件类型归类为图像，但只有部分格式支持提取元数据。受支持的格式包括 AVIF、BMP、GIF、HEIC、HEIF、JPEG、PNG、TIFF 和 WebP。

> [!NOTE]
> 图像变换过程中不会保留元数据。要从受支持的格式中提取元数据，请对*原始*图像资源使用该方法。

## 用法

调用 `Meta` 方法之前，请先用 [`reflect.IsImageResourceWithMeta`][] 函数确认资源支持提取元数据。

```go-html-template
{{ with resources.GetMatch "images/featured.*" }}
  {{ if reflect.IsImageResourceWithMeta . }}
    {{ with .Meta }}
      {{ .Date.Format "2006-01-02" }}
    {{ end }}
  {{ end }}
{{ end }}
```

## 方法

在 `Meta` 对象上使用这些方法。

`Date`
: （`time.Time`）返回图像创建日期/时间。用 [`time.Format`][] 函数格式化。

`Lat`
: （`float64`）返回 Exif 元数据中的 GPS 纬度（以度为单位），Exif 中没有时回退到 XMP 元数据。

`Long`
: （`float64`）返回 Exif 元数据中的 GPS 经度（以度为单位），Exif 中没有时回退到 XMP 元数据。

`Orientation`
: （`int`）返回 Exif `Orientation` 标记的值，取八种可能取值之一。

  取值|说明
  :--|:--
  `1`|水平（正常）
  `2`|水平镜像
  `3`|旋转 180 度
  `4`|垂直镜像
  `5`|水平镜像并顺时针旋转 270 度
  `6`|顺时针旋转 90 度
  `7`|水平镜像并顺时针旋转 90 度
  `8`|顺时针旋转 270 度

  > [!TIP]
  > 要根据图像的 Exif 方向标记按需旋转和翻转图像，请使用 [`images.AutoOrient`][] 图像滤镜

`Exif`
: （`meta.Tags`）返回该图像可用的 Exif 字段集合。可用字段由 [`sources`][] 设置决定，具体字段由 [`fields`][] 设置管理，两者都在项目配置中设置。

`IPTC`
: （`meta.Tags`）返回该图像可用的 IPTC 字段集合。可用字段由 [`sources`][] 设置决定，具体字段由 [`fields`][] 设置管理，两者都在项目配置中设置。

`XMP`
: （`meta.Tags`）返回该图像可用的 XMP 字段集合。可用字段由 [`sources`][] 设置决定，具体字段由 [`fields`][] 设置管理，两者都在项目配置中设置。

## 示例

要列出创建日期、纬度、经度和方向：

```go-html-template
{{ with resources.GetMatch "images/featured.*" }}
  {{ if reflect.IsImageResourceWithMeta . }}
    {{ with .Meta }}
      <pre>
        {{ printf "%-25s %v\n" "Date" .Date }}
        {{ printf "%-25s %v\n" "Latitude" .Lat }}
        {{ printf "%-25s %v\n" "Longitude" .Long }}
        {{ printf "%-25s %v\n" "Orientation" .Orientation }}
      </pre>
    {{ end }}
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

[Exif]: https://en.wikipedia.org/wiki/Exif
[IPTC]: https://en.wikipedia.org/wiki/IPTC_Information_Interchange_Model
[XMP]: https://en.wikipedia.org/wiki/Extensible_Metadata_Platform
[`fields`]: /configuration/imaging/#fields
[`images.AutoOrient`]: /functions/images/autoorient/
[`reflect.IsImageResource`]: /functions/reflect/isimageresource/
[`reflect.IsImageResourceProcessable`]: /functions/reflect/isimageresourceprocessable/
[`reflect.IsImageResourceWithMeta`]: /functions/reflect/isimageresourcewithmeta/
[`sources`]: /configuration/imaging/#sources
[`time.Format`]: /functions/time/format/
