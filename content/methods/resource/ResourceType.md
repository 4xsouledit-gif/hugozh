+++
title = "ResourceType"
linkTitle = "ResourceType"
description = "返回给定资源媒体类型的主类型。"
date = 2026-10-02
weight = 200
source = "https://gohugo.io/methods/resource/resourcetype/"

[params.functions_and_methods]
signatures = ["RESOURCE.ResourceType"]
returnType = "string"
+++

> [!NOTE]
> 该方法可用于全局资源、页面资源或远程资源。

## 这一页解决什么问题

`ResourceType` 返回的是 **Hugo 自己的资源分类**：`image`、`text`、`audio`、`video`，以及页面包里的 Markdown 文件所属的 `page`。它是模板里「按资源种类分流」最直接的依据——遍历一个页面包时，用它把图片和正文片段分开处理。

它与 [`MediaType`](/methods/resource/mediatype/) 的区别值得先记牢：`ResourceType` 是**Hugo 的分类**（粗粒度，决定你能用哪些方法），`MediaType` 是 **MIME 类型**（细粒度，决定浏览器怎么解释字节）。以页面包里的 `_objectives.md` 为例，它的 `ResourceType` 是 `page`，而 `MediaType.Type` 实测是 `application/octet-stream`——后者完全不能用来判断「这是不是 Markdown」。

## 什么时候用，什么时候别用

常见的资源类型包括 `audio`、`image`、`text` 和 `video`。

**该用**：

- 遍历页面包资源时按类型分流：`{{ range .Resources.ByType "page" }}` 拼正文片段，图片资源另走渲染分支；
- 需要把资源归入「图 / 文 / 音 / 视频」四类之一做样式或统计；
- 在模板注释/报错里说明资源种类。

**别用**：

- 判断能否做图像处理 → 用 [`reflect.IsImageResourceProcessable`](/functions/reflect/isimageresourceprocessable/)（`image` 类型的 SVG 也不能处理）；
- 判断浏览器该怎么解析字节 → 用 [`MediaType`](/methods/resource/mediatype/)；
- 判断是不是 Hugo 页面 → 用 [`reflect.IsPage`](/functions/reflect/ispage/)；`page` 是**资源**分类，不等于页面对象。

## 示例

```go-html-template
{{ with resources.Get "image/a.jpg" }}
  {{ .ResourceType }} → image
  {{ .MediaType.MainType }} → image
{{ end }}
```

处理内容文件时，资源类型为 `page`。

```tree
content/
├── lessons/
│   ├── lesson-1/
│   │   ├── _objectives.md  <-- resource type = page
│   │   ├── _topics.md      <-- resource type = page
│   │   ├── _example.jpg    <-- resource type = image
│   │   └── index.md
│   └── _index.md
└── _index.md
```

用上面的结构，可以遍历类型为 `page` 的页面资源来构建内容：

```go-html-template {file="layouts/lessons/page.html"}
{{ range .Resources.ByType "page" }}
  {{ .Content }}
{{ end }}
```

## 完整示例（实测）

测量条件：Hugo 0.167.0 extended，Windows，最小站点。页面包 `content/bundle/` 里有图片 `a.jpg`（在前置元数据中声明过）与 Markdown 片段 `_objectives.md`；`assets/quotations/kipling.txt` 是全局文本资源。放进 `layouts/_default/single.html`：

```go-html-template {file="layouts/_default/single.html"}
{{ with resources.Get "images/original.jpg" }}
  <p>全局图片：{{ .ResourceType }}</p>
{{ end }}
{{ with resources.Get "quotations/kipling.txt" }}
  <p>全局文本：{{ .ResourceType }}</p>
{{ end }}
{{ range .Resources }}
  <p>页面资源：{{ .Name }} → {{ .ResourceType }}（MIME 为 {{ .MediaType.Type }}）</p>
{{ end }}
{{ range .Resources.ByType "page" }}
  <p>拼接正文：{{ .Content }}</p>
{{ end }}
```

Hugo 渲染为：

```html
<p>全局图片：image</p>
<p>全局文本：text</p>
<p>页面资源：Sunrise in Bryce Canyon → image（MIME 为 image/jpeg）</p>
<p>页面资源：_objectives.md → page（MIME 为 application/octet-stream）</p>
<p>拼接正文：<h2 id="objectives">Objectives</h2>
<ul>
<li>One</li>
<li>Two</li>
</ul>
</p>
```

**你应当看到什么**：

- 图片资源是 `image`，文本资源是 `text`，页面包里的 `.md` 片段是 `page`；
- `_objectives.md` 的 MIME 是 `application/octet-stream`——**不要**用它判断 Markdown；
- `.Resources.ByType "page"` 只筛出 `.md` 片段；`.Content` 直接给出渲染好的 HTML（[`Content`](/methods/resource/content/) 的实测行为）。

## 返回值边界（实测）

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| 全局图片资源 | `image` | 否 |
| 全局文本资源 | `text` | 否 |
| 页面包里的图片资源 | `image` | 否 |
| 页面包里的 `.md` 片段 | `page`（MIME 实测为 `application/octet-stream`） | 否 |
| SVG 资源 | `image`（但 `reflect.IsImageResourceProcessable` 为 `false`） | 否 |
| `resources.Get` 找不到文件（`nil`） | —— | 是：`nil pointer evaluating resource.Resource.ResourceType` |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 没报错但结果不对 | 判断成 `image` 后调用 `.Width`，SVG 上就报错 | `ResourceType` 是粗分类，SVG 也算 `image` | 需要尺寸/处理时用 `reflect.IsImageResourceWithMeta` / `IsImageResourceProcessable` |
| 没报错但结果不对 | 想找页面包里的 Markdown，却用 MIME 筛 | 页面资源的 MIME 实测是 `application/octet-stream` | 用 `.Resources.ByType "page"` |
| 没报错但结果不对 | `{{ if eq .ResourceType "page" }}` 想拿到页面对象 | `page` 是资源分类，不是页面对象 | 要页面对象用 `site.GetPage` 等；要正文用 `.Content` |
| 报错看不懂 | `nil pointer evaluating resource.Resource.ResourceType` | `resources.Get` 没找到文件 | 用 `{{ with resources.Get "…" }}` 包住 |

更多排查入口见[故障排查](/troubleshooting/)。
