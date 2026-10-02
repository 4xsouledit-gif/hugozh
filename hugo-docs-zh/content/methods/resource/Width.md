+++
title = "Width"
linkTitle = "Width"
description = "返回给定图像资源的宽度。"
date = 2026-10-02
weight = 220
source = "https://gohugo.io/methods/resource/width/"

[params.functions_and_methods]
signatures = ["RESOURCE.Width"]
returnType = "int"
+++

> [!NOTE]
> 该方法可用于全局资源、页面资源或远程资源。

## 这一页解决什么问题

`Width` 回答「这张图有多宽」。它最常见的用途是让模板**自己算出** `<img>` 的 `width` 与各种占位尺寸，而不是把数字硬编码进模板：换了图，模板不用改。

它也是**布局决策**的输入：判断一张图是否宽到需要压缩、按宽度生成 `srcset` 候选、算宽高比做固定比例的容器。

## 什么时候用，什么时候别用

**该用**：

- 输出 `<img>` 的 `width` 属性（与 [`Height`](/methods/resource/height/) 成对使用）；
- 算宽高比：`div (float .Width) .Height`（注意要转 `float`，见下文实测）；
- 按宽度分支：`{{ if gt .Width 1600 }}` 时先缩小再输出。

**别用**：

- 想**改变**图片宽度 → 用 [`Resize`](/methods/resource/resize/) / [`Fit`](/methods/resource/fit/) / [`Fill`](/methods/resource/fill/) / [`Crop`](/methods/resource/crop/)；
- 判断「这是不是图像」→ 用 [`reflect.IsImageResource`](/functions/reflect/isimageresource/)；
- 读 Exif/IPTC/XMP → 用 [`Meta`](/methods/resource/meta/)。

调用 `Width` 方法之前，请先用 [`reflect.IsImageResourceWithMeta`][] 函数确认 Hugo 能否确定图像尺寸。

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
  <p>宽高比：{{ div (float .Width) .Height }}</p>
{{ end }}
```

Hugo 渲染为：

```html
<img src="/images/original.jpg" width="600" height="400" alt="">
<p>宽高比：1.5</p>
```

**你应当看到什么**：宽度读自图像文件头（600）。宽高比这里必须写 `div (float .Width) .Height`——直接写 `div .Width .Height` 得到的是**整数除法**的结果：实测 `div .Width .Height` → `1`，`div (float .Width) .Height` → `1.5`。这类「没报错但算错」的问题在模板里很常见。

再注意一个容易忽略的事实：`Width` 返回的是**那个资源对象**的宽度。对处理后的资源（`{{ with .Resize "300x" }}`）读到的是 300，而不是源图的 600；实测 `.Resize "300x"` 的结果是 300×200（等比，高度自动算出）。

## 返回值边界（实测）

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| 普通位图（JPEG/PNG 等） | `int` 像素宽度（实测 600×400 的图返回 `600`） | 否 |
| 处理后的图像资源 | 处理结果的像素宽度（实测 `Resize "300x"` → `300`，高度 200） | 否 |
| SVG（`image/svg+xml`） | `reflect.IsImageResource` 为 `true`，`IsImageResourceWithMeta` 为 `false` | 是：`error calling Width: resource "/images/shape.svg" of media type "image/svg+xml" does not support this method…` |
| 非图像资源（文本、CSS、JS） | —— | 是：`does not support this method: use reflect.IsImageResource…` |
| `resources.Get` 找不到文件（`nil`） | —— | 是：`nil pointer evaluating resource.Resource.Width` |
| 远程资源 | 需联网；本站未实测（受 `security.http` 白名单限制） | —— |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 没报错但结果不对 | 宽高比算出来是 `1` 或 `0` | `div` 两个整数做整数除法 | 至少转一个为浮点：`div (float .Width) .Height` |
| 没报错但结果不对 | 用源图的宽度去描述处理后的图 | `Width` 属于**那个对象**；处理结果是新对象 | 对处理结果再读一次 `.Width`/`.Height` |
| 报错看不懂 | `does not support this method` | 对象不是「带尺寸元数据的图像」（文本资源，或 SVG） | 先 `reflect.IsImageResourceWithMeta` 判断，不满足时只输出 `src` |
| 构建失败 | `nil pointer evaluating resource.Resource.Width` | `resources.Get` 没找到文件 | 用 `{{ with resources.Get "…" }}` 包住 |

更多排查入口见[故障排查](/troubleshooting/)。

[`reflect.IsImageResourceWithMeta`]: /functions/reflect/isimageresourcewithmeta/
