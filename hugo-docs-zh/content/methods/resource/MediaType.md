+++
title = "MediaType"
linkTitle = "MediaType"
description = "返回给定资源的媒体类型对象。"
date = 2026-10-02
weight = 110
source = "https://gohugo.io/methods/resource/mediatype/"

[params.functions_and_methods]
signatures = ["RESOURCE.MediaType"]
returnType = "media.Type"
+++

> [!NOTE]
> 该方法可用于全局资源、页面资源或远程资源。

## 示例

```go-html-template
{{ with resources.Get "images/a.jpg" }}
  {{ .MediaType.Type }} → image/jpeg
  {{ .MediaType.MainType }} → image
  {{ .MediaType.SubType }} → jpeg
  {{ .MediaType.Suffixes }} → [jpg jpeg jpe jif jfif]
  {{ .MediaType.FirstSuffix.Suffix }} → jpg
{{ end }}
```

## 方法

在 `MediaType` 对象上使用这些方法。

`Type`
: (`string`) 返回媒体类型。

`MainType`
: (`string`) 返回媒体类型的主类型。

`SubType`
: (`string`) 返回媒体类型的子类型。

`Suffixes`
: (`slice`) 返回媒体类型可能的文件后缀切片。

`FirstSuffix.Suffix`
: (`string`) 返回媒体类型可能的文件后缀中的第一个。
