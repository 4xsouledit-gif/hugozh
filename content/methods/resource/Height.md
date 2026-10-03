+++
title = "Height"
linkTitle = "Height"
description = "返回给定图像资源的高度。"
date = 2026-10-02
weight = 100
source = "https://gohugo.io/methods/resource/height/"

[params.functions_and_methods]
signatures = ["RESOURCE.Height"]
returnType = "int"
+++

> [!NOTE]
> 该方法可用于全局资源、页面资源或远程资源。

## 这一页解决什么问题

页面里放图片时，如果只写 `src`，浏览器要等图片下载完才知道它多高，页面内容会在下载过程中**跳一下**（CLS）。`Height` 就是把「这张图有多高」交给模板，让你写出 `height="…"`，浏览器据此提前留出空间。

它同时也是**布局计算**的依据：算宽高比（`.Width` / `.Height`）做占位框、判断一张图是否大到需要先缩小再输出。

## 什么时候用，什么时候别用

**该用**：

- 输出 `<img>` 的 `height` 属性（几乎总是与 [`Width`](/methods/resource/width/) 成对出现）；
- 计算宽高比：`div .Width .Height`、`mul .Height 2` 之类的布局运算；
- 判断源图大小，决定是否需要 `Resize`。

**别用**：

- 想**改变**图片尺寸 → `Height` 只读，改尺寸用 [`Resize`](/methods/resource/resize/) / [`Fit`](/methods/resource/fit/) / [`Fill`](/methods/resource/fill/) / [`Crop`](/methods/resource/crop/)；
- 只想判断「这是不是图像资源」→ 用 [`reflect.IsImageResource`](/functions/reflect/isimageresource/) 或 `.MediaType.MainType`；
- 想读元数据（Exif/方向）→ 用 [`Meta`](/methods/resource/meta/)。

调用 `Height` 方法之前，请先用 [`reflect.IsImageResourceWithMeta`][] 函数确认 Hugo 能否确定图像尺寸。

```go-html-template
{{ with resources.GetMatch "images/featured.*" }}
  {{ if reflect.IsImageResourceWithMeta . }}
    <img src="{{ .RelPermalink }}" width="{{ .Width }}" height="{{ .Height }}" alt="">
  {{ else }}
    <img src="{{ .RelPermalink }}" alt="">
  {{ end }}
{{ end }}
```

## 完整示例（实测）

测量条件：Hugo 0.167.0 extended，Windows；`assets/images/original.jpg` 是一张 600×400 的 JPEG。放进 `layouts/_default/single.html`：

```go-html-template {file="layouts/_default/single.html"}
{{ with resources.Get "images/original.jpg" }}
  <img src="{{ .RelPermalink }}" width="{{ .Width }}" height="{{ .Height }}" alt="">
{{ end }}
```

Hugo 渲染为：

```html
<img src="/images/original.jpg" width="600" height="400" alt="">
```

**你应当看到什么**：宽高读的是图像文件头里的真实尺寸（600×400），没有做任何处理时 `RelPermalink` 就是原路径。换成处理后的资源，读到的是**处理结果**的尺寸（实测 `.Resize "100x"` 的结果是 100×67）。

SVG 是这里最容易踩的坑：它**是**图像资源，但没有「像素尺寸」这种元数据：

```text
{{ with resources.Get "images/shape.svg" }}
  {{ reflect.IsImageResource . }}           → true
  {{ reflect.IsImageResourceWithMeta . }}   → false
  {{ .Width }}                              → 构建失败
{{ end }}
```

所以上游要求先过 `reflect.IsImageResourceWithMeta`，而不是只判断「是不是图像」。

## 返回值边界（实测）

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| 普通位图（JPEG/PNG 等） | `int` 像素高度（实测 600×400 的图返回 `400`） | 否 |
| 处理后的图像资源 | 处理结果的像素高度（实测 `Resize "100x"` → `100×67`） | 否 |
| SVG（`image/svg+xml`） | `reflect.IsImageResource` 为 `true`，`IsImageResourceWithMeta` 为 `false` | 是：`error calling Height: resource "/images/shape.svg" of media type "image/svg+xml" does not support this method…` |
| 非图像资源（文本、CSS、JS） | —— | 是：`does not support this method: use reflect.IsImageResource…` |
| `resources.Get` 找不到文件（`nil`） | —— | 是：`nil pointer evaluating resource.Resource.Height` |
| 远程资源 | 需联网；本站未实测（受 `security.http` 白名单限制） | —— |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 报错看不懂 | `does not support this method` | 对象不是「带尺寸元数据的图像」（文本资源，或 SVG） | 用 `reflect.IsImageResourceWithMeta` 先判断，不满足时只输出 `src` |
| 没报错但结果不对 | `height` 属性与图片实际高度不符 | 读的是源图高度，却对处理后的图用了源图的数值 | 用处理结果对象的 `.Height`，别提前算 |
| 没报错但结果不对 | 图片被拉长/压扁 | `width` 与 `height` 只写了一个，或与实际宽高比不符 | 两个属性都写，且取 `.Width`/`.Height` 的真实值 |
| 构建失败 | `nil pointer evaluating resource.Resource.Height` | `resources.Get` 没找到文件 | 用 `{{ with resources.Get "…" }}` 包住 |

更多排查入口见[故障排查](/troubleshooting/)。

[`reflect.IsImageResourceWithMeta`]: /functions/reflect/isimageresourcewithmeta/
