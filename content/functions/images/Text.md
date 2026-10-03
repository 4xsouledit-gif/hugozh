+++
title = "images.Text"
linkTitle = "Text"
description = "返回一个为图像添加文字的图像滤镜。"
date = 2026-10-02
weight = 250
source = "https://gohugo.io/functions/images/text/"

[params.functions_and_methods]
signatures = ["images.Text TEXT [OPTIONS]"]
returnType = "images.filter"
+++

## 选项

`images.Text` 滤镜接受一个选项映射（map）。

虽然这些选项都不是必填的，但至少应把 `size` 设为图像高度的某个合理比例。

`alignx`
: **（0.141.0 新增）** （`string`）文字相对于水平偏移量的水平对齐方式，取 `left`、`center` 或 `right` 之一。默认为 `left`。

`aligny`
: **（0.147.0 新增）** （`string`）文字相对于垂直偏移量的垂直对齐方式，取 `top`、`center` 或 `bottom` 之一。默认为 `top`。

`color`
: （`string`）字体颜色，可以是 3 位或 6 位十六进制颜色码。默认为 `#ffffff`（白色）。

`font`
: （`resource.Resource`）字体可以是全局资源、页面资源或远程资源。默认是 [Go Regular][]，一种比例式无衬线 TrueType 字体。

`linespacing`
: （`int`）每行之间的像素数。若行高为 1.4，把 `linespacing` 设为 `size` 的 0.4 倍。默认为 `2`。

`size`
: （`int`）以像素为单位的字号。默认为 `20`。

`x`
: （`int`）相对于图像左边缘的水平偏移量，单位为像素。默认为 `10`。

`y`
: （`int`）相对于图像上边缘的垂直偏移量，单位为像素。默认为 `10`。

## 用法

设置文本和路径：

```go-html-template
{{ $text := "Zion National Park" }}
{{ $fontPath := "https://github.com/google/fonts/raw/main/ofl/lato/Lato-Regular.ttf" }}
{{ $imagePath := "images/original.jpg" }}
```

把字体捕获为资源：

```go-html-template
{{ $font := "" }}
{{ with try (resources.GetRemote $fontPath) }}
  {{ with .Err }}
    {{ errorf "%s" . }}
  {{ else with .Value }}
    {{ $font = . }}
  {{ else }}
    {{ errorf "Unable to get resource %s" $fontPath }}
  {{ end }}
{{ end }}
```

创建滤镜，让文字在水平和垂直方向上都居中：

```go-html-template
{{ $r := "" }}
{{ $filter := "" }}
{{ with $r = resources.Get $imagePath }}
  {{ $opts := dict
    "alignx" "center"
    "aligny" "center"
    "color" "#fbfaf5"
    "font" $font
    "linespacing" 8
    "size" 60
    "x" (mul .Width 0.5 | int)
    "y" (mul .Height 0.5 | int)
  }}
  {{ $filter = images.Text $text $opts }}
{{ else }}
  {{ errorf "Unable to get resource %s" $imagePath }}
{{ end }}
```

用 [`images.Filter`][] 函数应用该滤镜：

```go-html-template
{{ with $r }}
  {{ with . | images.Filter $filter }}
    <img src="{{ .RelPermalink }}" width="{{ .Width }}" height="{{ .Height }}" alt="">
  {{ end }}
{{ end }}
```

也可以在 `Resource` 对象上调用 [`Filter`][] 方法应用该滤镜：

```go-html-template
{{ with $r }}
  {{ with .Filter $filter }}
    <img src="{{ .RelPermalink }}" width="{{ .Width }}" height="{{ .Height }}" alt="">
  {{ end }}
{{ end }}
```

## 示例

英文原文此处用示例照片演示叠加文字 `Zion National Park` 的前后对比效果；本站未收录该示例图。

[Go Regular]: https://go.dev/blog/go-fonts#sans-serif
[`Filter`]: /methods/resource/filter/
[`images.Filter`]: /functions/images/filter/
