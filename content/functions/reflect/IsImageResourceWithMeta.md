+++
title = "reflect.IsImageResourceWithMeta"
linkTitle = "IsImageResourceWithMeta"
description = "报告给定值是否为资源（Resource）对象，且表示一张 Hugo 能提取尺寸、并在存在时提取 Exif、IPTC 与 XMP 数据的图像。"
date = 2026-10-02
weight = 40
source = "https://gohugo.io/functions/reflect/isimageresourcewithmeta/"

[params.functions_and_methods]
signatures = ["reflect.IsImageResourceWithMeta INPUT"]
returnType = "bool"
+++

## 这一页解决什么问题

你想在文章里显示「拍摄于 2024-05-26」这类信息，于是写 `.Meta.Date`。如果这张图是 SVG 或 ICO，构建直接中断：

```text
error calling Meta: resource "/images/h.ico" of media type "image/x-icon" does not support this method: use reflect.IsImageResource, reflect.IsImageResourceProcessable, or reflect.IsImageResourceWithMeta to check if the resource supports this method before calling it
```

`reflect.IsImageResourceWithMeta` 用来确认「这张图支持元数据读取」。另外要记住：**支持读元数据 ≠ 真的有元数据**——没有 Exif 的 PNG 会给出零值时间，必须自己判断。

## 什么时候用，什么时候别用

**该用**：

- 在调用 `.Meta`、`.Meta.Date`、`.Exif` 之前守卫；
- 混合图片目录里只想对「可能有拍摄信息」的格式渲染元数据。

**别用**：

- 想按尺寸渲染 `<img>`（`.Width`/`.Height` 大多数图片格式都有）→ 用 [reflect.IsImageResource](/functions/reflect/isimageresource/) 即可；
- 想缩放图片 → 用 [reflect.IsImageResourceProcessable](/functions/reflect/isimageresourceprocessable/)；
- 想拿到「拍摄时间」而图片没有 Exif 时**不要直接输出 `.Date`** → 先用 `.Date.IsZero` 判断（实测无 Exif 的 PNG 得到 `0001-01-01 00:00:00 +0000 UTC`）。

**（0.157.0 新增）**

## 用法

下例遍历项目的全部资源，用 `reflect.IsImageResourceWithMeta` 只为受支持的格式显示图像尺寸与元数据。

```go-html-template
{{ range resources.Match "**" }}
  {{ if reflect.IsImageResourceWithMeta . }}
    <img src="{{ .RelPermalink }}" width="{{ .Width }}" height="{{ .Height }}" alt="Image with Meta">
    {{ with .Meta }}
      <p>Taken on: {{ .Date }}</p>
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

> [!NOTE]
> 上表中 AVIF、BMP、GIF、ICO、JPEG、PNG、SVG、TIFF、WebP 九种格式已在本站用 Hugo 0.167.0 逐格式实测，与表格一致；HEIC 与 HEIF 无法在本环境生成样本文件，未实测（来源：上游表格）。

## 完整示例：有 Exif 的显示日期，没有的自行判断

```go-html-template {file="layouts/_partials/photo-meta.html"}
{{ range slice "images/a.jpg" "images/c.png" }}
  {{ with resources.Get . }}
    {{ if reflect.IsImageResourceWithMeta . }}
      <img src="{{ .RelPermalink }}" width="{{ .Width }}" height="{{ .Height }}" alt="Image with Meta">
      {{ with .Meta }}
        {{ if .Date.IsZero }}无拍摄时间{{ else }}Taken on: {{ .Date }}{{ end }}
      {{ end }}
    {{ end }}
  {{ end }}
{{ end }}
```

Hugo 0.167.0 实测渲染为（测量环境时区为 Asia/Shanghai）：

```html
<img src="/images/a.jpg" width="40" height="20" alt="Image with Meta">
Taken on: 2024-05-26 07:19:55 &#43;0800 CST
<img src="/images/c.png" width="40" height="20" alt="Image with Meta">
无拍摄时间
```

**你应当看到什么**：JPEG 带着 Exif 的 `DateTimeOriginal`，所以打印出拍摄时间（`+` 被 HTML 实体化为 `&#43;`，浏览器显示仍是 `+`）；PNG 没有 Exif，`.Date` 是零值 `0001-01-01 00:00:00 +0000 UTC`，被 `.IsZero` 拦下并输出「无拍摄时间」。**如果漏掉 `.IsZero` 判断，页面上就会出现 `0001-01-01`。**

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，单语言站点，Windows。样本为 `assets/images/` 下用 Pillow 生成的真实文件（其中 `a.jpg` 写入 Exif `DateTimeOriginal`）。

| 输入 | 结果 | 是否报错 |
| --- | --- | --- |
| JPEG（含或不含 Exif）、PNG、GIF、BMP、TIFF、WebP、AVIF 资源 | `true` | 否 |
| SVG 资源 | `false` | 否 |
| ICO 资源 | `false` | 否 |
| `nil`（`resources.Get` 未命中） | `false` | 否 |
| 对 ICO 直接调用 `.Meta` | —— | 是：`error calling Meta: resource "/images/h.ico" of media type "image/x-icon" does not support this method: …` |
| 有 Exif 的 JPEG 取 `.Meta.Date` | 读出真实时间（实测 `2024-05-26 07:19:55 +0800 CST`） | 否 |
| 无 Exif 的 PNG 取 `.Meta.Date` | 零值 `0001-01-01 00:00:00 +0000 UTC`，`.Date.IsZero` 为 `true` | 否 |
| 返回类型 | `bool` | 否 |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 没报错但结果不对 | 页面上出现 `0001-01-01 00:00:00` | 图片没有 Exif，`.Meta.Date` 是零值 | 用 `{{ if .Date.IsZero }}` 判断后再输出 |
| 报错看不懂 | `does not support this method: … IsImageResourceWithMeta …` | 对 SVG／ICO 等调用 `.Meta` | 先 `reflect.IsImageResourceWithMeta` 守卫 |
| 没报错但结果不对 | 明明有 Exif 却读不到 | Exif 写在非标准字段，或被图片处理工具剥掉了 | 用 `exiftool` 等工具确认原文件；Hugo 只读标准 Exif/IPTC/XMP |
| 报错看不懂 | `wrong number of args for IsImageResourceWithMeta: want 1 got 2` | 内层函数调用没加括号 | 写 `{{ reflect.IsImageResourceWithMeta (resources.Get "images/a.jpg") }}` |

更多排查入口见[故障排查](/troubleshooting/)。

[`reflect.IsImageResourceProcessable`]: /functions/reflect/isimageresourceprocessable/
[`reflect.IsImageResourceWithMeta`]: /functions/reflect/isimageresourcewithmeta/
[`reflect.IsImageResource`]: /functions/reflect/isimageresource/
