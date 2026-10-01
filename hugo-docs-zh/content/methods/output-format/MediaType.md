+++
title = "MediaType"
linkTitle = "MediaType"
description = "返回给定输出格式的媒体类型。"
date = 2026-10-02
weight = 10
source = "https://gohugo.io/methods/output-format/mediatype/"

[params.functions_and_methods]
signatures = ["OUTPUTFORMAT.MediaType"]
returnType = "media.Type"
+++

要使用该方法，你必须先通过 [`Get`][] 或 [`Canonical`][] 方法，从页面的 [`OutputFormats`][] 集合中选出特定的 [output format](g)（输出格式）。

## 示例

```go-html-template
{{ with .Site.Home.OutputFormats.Get "rss" }}
  {{ with .MediaType }}
    {{ .Type }} → application/rss+xml
    {{ .MainType }} → application
    {{ .SubType }} → rss
    {{ .Suffixes }} → [rss]
    {{ .FirstSuffix.Suffix }} → rss
  {{ end }}
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

[`Canonical`]: /methods/page/outputformats/#canonical
[`Get`]: /methods/page/outputformats/#get
[`OutputFormats`]: /methods/page/outputformats/
