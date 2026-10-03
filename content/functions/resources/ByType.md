+++
title = "resources.ByType"
linkTitle = "ByType"
description = "返回给定媒体类型的全局资源集合；一个都没有时返回 nil。"
date = 2026-10-02
weight = 20
source = "https://gohugo.io/functions/resources/bytype/"

[params.functions_and_methods]
signatures = ["resources.ByType MEDIATYPE"]
returnType = "resource.Resources"
+++

## 这一页解决什么问题

有时候你要的不是「某个文件」，而是「某一类文件全部」：把 `assets/` 下的图片都列成图片墙、统计站点用了多少样式表、按类型生成资源清单。逐个写 `resources.Get "a.jpg"`、`resources.Get "b.png"` 显然不现实。

`resources.ByType` 按**媒体类型的大类**一次性取出全部全局资源。

## 什么时候用，什么时候别用

**该用**：

- 需要「所有某类资源」，且不关心具体路径；
- 想按类型统计数量（`len`）；
- 想给每张图片批量生成 `<img>` 或走图片处理管道。

**别用**：

- 知道具体路径 → 用 [`resources.Get`](/functions/resources/get/)；知道模式 → 用 [`resources.GetMatch`](/functions/resources/match/)／[`resources.Match`](/functions/resources/match/)；
- 要取**页面资源** → 用页面对象上的 [`Resources.ByType`](/methods/page/resources/) 方法；
- 想按完整媒体类型（`image/png`）筛选 → 实测 `resources.ByType "image/png"` 返回 0 个；这个参数只认大类。

[媒体类型][]通常是 `image`、`text`、`audio`、`video` 或 `application` 之一。

```go-html-template
{{ range resources.ByType "image" }}
  <img src="{{ .RelPermalink }}" width="{{ .Width }}" height="{{ .Height }}" alt="">
{{ end }}
```

> [!NOTE]
> 该函数作用于全局资源。全局资源是位于 `assets` 目录内，或位于任何挂载到 `assets` 目录的目录内的文件。
>
> 对于页面资源，请使用 `Page` 对象上的 [`Resources.ByType`][] 方法。

## 完整示例：统计并遍历各类资源

`assets/` 下有 10 个图片资源、5 个文本资源（3 个 JS、2 个 CSS），没有任何音频文件：

```go-html-template {file="layouts/_partials/asset-index.html"}
<p>图片：{{ len (resources.ByType "image") }} 个</p>
<p>文本：{{ len (resources.ByType "text") }} 个</p>
<p>音频：{{ len (resources.ByType "audio") }} 个</p>
<p>空集合在 if 里：{{ if resources.ByType "audio" }}为真{{ else }}为假{{ end }}</p>
```

Hugo 0.167.0 实测渲染为：

```html
<p>图片：10 个</p>
<p>文本：5 个</p>
<p>音频：0 个</p>
<p>空集合在 if 里：为假</p>
```

**你应当看到什么**：`len` 直接给出数量；一个都没匹配到时返回值是**空集合**，`len` 为 0，在 `if` 里判为假（上游描述为「返回 nil」，实测行为等价：`with`／`if` 都会跳过）。注意集合内部的**顺序不是文件名顺序**（实测 10 个图片里 `a.jpg` 排在第 6 位；上游未说明顺序规则），需要固定顺序请自己 `sort`。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，单语言站点，Windows；`assets/` 下含 10 个图片、5 个文本资源。

| 输入 | 结果 | 是否报错 |
| --- | --- | --- |
| `"image"` | 10 个资源 | 否 |
| `"text"` | 5 个资源（CSS 与 JS 都属于 `text/*`） | 否 |
| `"audio"`（无匹配） | 空集合，`len` 为 0，`if` 判假 | 否 |
| `"image/png"`（完整媒体类型） | 0 个（实测：只认大类） | 否 |
| `"IMAGE"`（大写） | 0 个（实测：区分大小写） | 否 |
| `"application/json"` | 0 个（应为 `"application"`） | 否 |
| 返回类型 | `resource.Resources`（可 `range`、可 `len`、可 `where`） | 否 |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 没报错但结果不对 | 明明有 PNG，`resources.ByType "image/png"` 却是 0 | 参数只接受大类 | 写 `"image"`，再在循环里用 `.MediaType.Type` 筛选 |
| 没报错但结果不对 | 取到的资源列表顺序和文件名顺序不一样 | 顺序不是文件名序（实测 `a.jpg` 不在首位；上游未说明规则） | 用 `sort` 或自己维护顺序 |
| 没报错但结果不对 | 只有部分图片出现 | 图片放在页面包里而不是 `assets/` | 改用页面对象的 `.Resources.ByType` 方法 |
| 没报错但结果不对 | 页面上很多图片没有尺寸 | 视频、SVG 之类没有 `.Width` | 先 `reflect.IsImageResource` / `reflect.IsImageResourceProcessable` 守卫 |

更多排查入口见[故障排查](/troubleshooting/)。

[`Resources.ByType`]: /methods/page/resources/
[媒体类型]: https://en.wikipedia.org/wiki/Media_type
