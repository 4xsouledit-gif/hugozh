+++
title = "reflect.IsImageResource"
linkTitle = "IsImageResource"
description = "报告给定值是否为资源（Resource）对象，且按其媒体类型判断它表示一张图像。"
date = 2026-10-02
weight = 20
source = "https://gohugo.io/functions/reflect/isimageresource/"

[params.functions_and_methods]
signatures = ["reflect.IsImageResource INPUT"]
returnType = "bool"
+++

## 这一页解决什么问题

`resources.Match "**"` 会把 `assets/` 下的所有文件都捞出来：CSS、JS、JSON、图片混在一起。如果你想给图片渲染 `<img>`、给其它文件渲染下载链接，就需要一个「这是图片吗」的判断。

`reflect.IsImageResource` 按**媒体类型**回答这个问题。要点是：它只回答「是不是图像资源」，**不回答「Hugo 能不能处理它」**——SVG 与 ICO 都算图像，但都不能缩放（见下表与 [reflect.IsImageResourceProcessable](/functions/reflect/isimageresourceprocessable/)）。

## 什么时候用，什么时候别用

**该用**：

- 遍历资源集合时按「图片 / 非图片」分派（渲染 `<img>` 还是下载链接）；
- 在取 `.Width`、`.Height` 之前守卫——这两个方法对非图片没有意义。

**别用**：

- 想判断「能不能缩放/转换」→ 用 [reflect.IsImageResourceProcessable](/functions/reflect/isimageresourceprocessable/)；实测 SVG 与 ICO 的 `IsImageResource` 是 `true` 但 `IsImageResourceProcessable` 是 `false`；
- 想判断「能不能读 Exif」→ 用 [reflect.IsImageResourceWithMeta](/functions/reflect/isimageresourcewithmeta/)；
- 想区分**具体格式**（JPEG 还是 PNG）→ 看资源的 `.MediaType.Type`（实测 JPEG 为 `image/jpeg`、WebP 为 `image/webp`）；
- 想判断页面 → 用 [reflect.IsPage](/functions/reflect/ispage/)；实测对页面对象本函数返回 `false`。

**（0.154.0 新增）**

## 用法

下例遍历项目的全部资源，用 `reflect.IsImageResource` 决定是渲染 `img` 标签，还是为非图像文件给出下载链接。

```go-html-template
{{ range resources.Match "**" }}
  {{ if reflect.IsImageResource . }}
    <img src="{{ .RelPermalink }}" alt="Image">
  {{ else }}
    <a href="{{ .RelPermalink }}">Download</a>
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
> 上表中 AVIF、BMP、GIF、ICO、JPEG、PNG、SVG、TIFF、WebP 九种格式的三列取值已在本站用 Hugo 0.167.0 逐格式实测复现，与表格一致；HEIC 与 HEIF 无法在本环境生成样本文件，未实测（来源：上游表格）。

## 完整示例：图片与普通文件分派

```go-html-template {file="layouts/_partials/asset-list.html"}
{{ range slice "images/a.jpg" "images/b.svg" "data/a.json" }}
  {{ with resources.Get . }}
    {{ if reflect.IsImageResource . }}
      <img src="{{ .RelPermalink }}" alt="Image">
    {{ else }}
      <a href="{{ .RelPermalink }}">Download</a>
    {{ end }}
  {{ end }}
{{ end }}
```

Hugo 0.167.0 实测渲染为（空行来自模板自身的换行）：

```html
<img src="/images/a.jpg" alt="Image">
<img src="/images/b.svg" alt="Image">
<a href="/data/a.json">Download</a>
```

**你应当看到什么**：SVG 走的是 `<img>` 分支——它是图像资源；JSON 走下载分支。如果你以为「不能缩放的就不是图片」，就会在这里判错，这正是需要区分 `IsImageResource` 与 `IsImageResourceProcessable` 的原因。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，单语言站点，Windows。样本为 `assets/images/` 下用 Pillow 生成的真实文件（40×20）。

| 输入 | 结果 | 是否报错 |
| --- | --- | --- |
| JPEG、PNG、GIF、BMP、TIFF、WebP、AVIF 资源 | `true` | 否 |
| SVG 资源 | `true`（但不可处理） | 否 |
| ICO 资源 | `true`（但不可处理、无元数据） | 否 |
| 文本类资源（`.json`、`.css`、`.js`） | `false` | 否 |
| `resources.Get` 未命中（`nil`） | `false` | 否 |
| 字符串、`dict` | `false`（实测） | 否 |
| 页面对象 | `false`（实测） | 否 |
| `nil` 字面量 | `false`（实测） | 否 |
| 返回类型 | `bool` | 否 |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 没报错但结果不对 | SVG/ICO 走进「图片」分支后 `.Process` 报错 | `IsImageResource` 为真不等于可处理 | 处理前加 `reflect.IsImageResourceProcessable` |
| 报错看不懂 | `… does not support this method: use reflect.IsImageResource…` | 对该格式不支持的方法（如 ICO 的 `.Meta`）直接调用 | 按报错提示用对应的 `reflect.IsImage*` 守卫 |
| 没报错但结果不对 | 想按格式区分，却只得到「是图片」 | 本函数只回答是否图像，不给出具体格式 | 用 `.MediaType.Type`（实测 JPEG 为 `image/jpeg`） |
| 报错看不懂 | `wrong number of args for IsImageResource: want 1 got 2` | 内层函数调用没加括号 | 写 `{{ reflect.IsImageResource (resources.Get "images/a.jpg") }}` |

更多排查入口见[故障排查](/troubleshooting/)。

[`reflect.IsImageResourceProcessable`]: /functions/reflect/isimageresourceprocessable/
[`reflect.IsImageResourceWithMeta`]: /functions/reflect/isimageresourcewithmeta/
[`reflect.IsImageResource`]: /functions/reflect/isimageresource/
