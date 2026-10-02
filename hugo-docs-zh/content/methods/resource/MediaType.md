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

## 这一页解决什么问题

`MediaType` 回答「这个资源**是什么类型**」，并给出 MIME 字符串与文件后缀。它让模板能**按类型分支**，而不是猜扩展名：

- 拼 data URI 需要正确的 MIME：`data:{{ .MediaType.Type }};base64,…`；
- 输出 `<source type="…">`、`<link type="…">` 需要 MIME；
- 判断资源属于 `image` / `text` / `video` 哪个大类，再决定走哪条处理分支；
- 生成临时文件名时需要「这个类型常用哪个后缀」。

## 什么时候用，什么时候别用

**该用**：

- 需要 MIME 字符串（data URI、`<source>`、`<link>`、RSS 附件）；
- 需要按大类分支：`{{ if eq .MediaType.MainType "image" }}`；
- 需要后缀：`.MediaType.FirstSuffix.Suffix`（例如给下载文件命名）。

**别用**：

- 判断「这张图能不能被处理」→ 用 [`reflect.IsImageResourceProcessable`](/functions/reflect/isimageresourceprocessable/)；`image/jpeg` 是图像，但判断可处理性还有别的条件；
- 判断「有没有尺寸/元数据」→ 用 [`reflect.IsImageResourceWithMeta`](/functions/reflect/isimageresourcewithmeta/)（实测 SVG 的 `MainType` 是 `image`，却没有尺寸）；
- 直接读资源内容 → 用 [`Content`](/methods/resource/content/)；
- 拿资源类型（`image`/`page` 等 Hugo 的分类）→ 用 [`ResourceType`](/methods/resource/resourcetype/)。

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

## 完整示例（实测）

测量条件：Hugo 0.167.0 extended，Windows；`assets/images/original.jpg` 是 600×400 的 JPEG，`assets/quotations/kipling.txt` 是纯文本。放进 `layouts/_default/single.html`：

```go-html-template {file="layouts/_default/single.html"}
{{ with resources.Get "images/original.jpg" }}
  <p>{{ .MediaType.Type }} | {{ .MediaType.MainType }} | {{ .MediaType.SubType }} | {{ .MediaType.Suffixes }} | {{ .MediaType.FirstSuffix.Suffix }}</p>
{{ end }}
{{ with resources.Get "quotations/kipling.txt" }}
  <p>{{ .MediaType.Type }} | {{ .MediaType.MainType }} | {{ .MediaType.SubType }} | {{ .MediaType.Suffixes }}</p>
{{ end }}
```

Hugo 渲染为：

```html
<p>image/jpeg | image | jpeg | [jpg jpeg jpe jif jfif] | jpg</p>
<p>text/plain | text | plain | [txt]</p>
```

**你应当看到什么**：`Type` 是完整的 MIME（`主类型/子类型`），`MainType`/`SubType` 是它的两半，`Suffixes` 是该类型**所有**可能的后缀（JPEG 有 5 个），`FirstSuffix.Suffix` 是其中 Hugo 优先使用的那个。用 `FirstSuffix.Suffix` 比自己截取扩展名可靠——源文件叫 `photo.jfif` 时，它仍会给出规范的 `jpg`。

## 返回值边界（实测）

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| JPEG 资源 | `image/jpeg`，`MainType` 为 `image`，`FirstSuffix.Suffix` 为 `jpg` | 否 |
| 文本资源 | `text/plain`，`Suffixes` 为 `[txt]` | 否 |
| 处理后的资源（如 `Process "… webp"`） | `Type` 变为 `image/webp`（随目标格式变化） | 否 |
| SVG 资源 | `image/svg+xml`，`MainType` 仍为 `image`（但用 `reflect.IsImageResourceWithMeta` 判断为 `false`） | 否 |
| 页面资源（类型为 `page` 的 `.md` 文件） | 实测 `application/octet-stream`——**不是** `text/markdown`，不要拿它当「是不是 Markdown」的依据 | 否 |
| `resources.Get` 找不到文件（`nil`） | —— | 是：`nil pointer evaluating resource.Resource.MediaType` |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 没报错但结果不对 | data URI 在浏览器里不显示 | MIME 写错，或用了文件扩展名当 MIME | 用 `.MediaType.Type`，不要手写 |
| 没报错但结果不对 | 判断「图像」时把 SVG 也算进去了，随后 `.Width` 报错 | `MainType` 为 `image` 不代表有尺寸元数据 | 尺寸判断用 `reflect.IsImageResourceWithMeta` |
| 没报错但结果不对 | 以为页面资源的媒体类型是 `text/markdown` | 实测页面资源是 `application/octet-stream` | 判断资源类型请用 [`ResourceType`](/methods/resource/resourcetype/) |
| 报错看不懂 | `nil pointer evaluating resource.Resource.MediaType` | `resources.Get` 没找到文件 | 用 `{{ with resources.Get "…" }}` 包住 |

更多排查入口见[故障排查](/troubleshooting/)。
