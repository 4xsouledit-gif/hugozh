+++
title = "Meta"
linkTitle = "Meta"
description = "返回图像的 Exif、IPTC 与 XMP 元数据（格式支持时）。"
date = 2026-10-02
weight = 120
source = "https://gohugo.io/methods/resource/meta/"

[params.functions_and_methods]
signatures = ["RESOURCE.Meta"]
returnType = "meta.MetaInfo"
+++

**（0.155.3 新增）**

> [!NOTE]
> 该方法可用于全局资源、页面资源或远程资源。

图像 `Resource` 对象上的 `Meta` 方法返回一个对象，其中包含 [Exif][]、[IPTC][] 与 [XMP][] 元数据。

Hugo 会把许多文件类型归类为图像，但只有部分格式支持提取元数据。受支持的格式包括 AVIF、BMP、GIF、HEIC、HEIF、JPEG、PNG、TIFF 和 WebP。

> [!NOTE]
> 图像变换过程中不会保留元数据。要从受支持的格式中提取元数据，请对*原始*图像资源使用该方法。

## 这一页解决什么问题

照片文件里除了像素，还带着一层「说明文字」：拍摄时间、GPS 坐标、相机方向、作者、版权。`Meta` 就是读取这层信息的统一入口——一次返回 **Exif、IPTC、XMP** 三套元数据中 Hugo 已解析的部分，另有 `Date`、`Lat`、`Long`、`Orientation` 四个整理好的字段。

它能支撑的具体需求：在图片旁显示拍摄地点与时间；按 `Orientation` 给图片加 CSS 旋转；把版权信息输出到页面底部。

## 什么时候用，什么时候别用

**该用**：

- 需要拍摄时间、GPS、方向、版权等**来自文件本身**的信息；
- 做图片画廊/旅行日志，要自动标注地点和时间；
- 需要按 `Orientation` 决定是否旋转（或直接改用 `images.AutoOrient` 滤镜，见上游示例）。

**别用**：

- 需要的是**前置元数据**（你自己在 front matter 里写的 `lat`、`alt` 等）→ 用 [`Params`](/methods/resource/params/)；
- 需要 HTTP 响应信息 → 用 [`Data`](/methods/resource/data/)；
- 只想读尺寸 → 用 [`Width`](/methods/resource/width/) / [`Height`](/methods/resource/height/)；`Meta` 更重，而且对 ICO/SVG 这类格式根本不可用；
- 0.155.0 之前的写法 `.Exif` → 见 [`Exif`](/methods/resource/exif/)（已弃用）。

## 用法

调用 `Meta` 方法之前，请先用 [`reflect.IsImageResourceWithMeta`][] 函数确认资源支持提取元数据。

```go-html-template
{{ with resources.GetMatch "images/featured.*" }}
  {{ if reflect.IsImageResourceWithMeta . }}
    {{ with .Meta }}
      {{ .Date.Format "2006-01-02" }}
    {{ end }}
  {{ end }}
{{ end }}
```

## 方法

在 `Meta` 对象上使用这些方法。

`Date`
: （`time.Time`）返回图像创建日期/时间。用 [`time.Format`][] 函数格式化。

`Lat`
: （`float64`）返回 Exif 元数据中的 GPS 纬度（以度为单位），Exif 中没有时回退到 XMP 元数据。

`Long`
: （`float64`）返回 Exif 元数据中的 GPS 经度（以度为单位），Exif 中没有时回退到 XMP 元数据。

`Orientation`
: （`int`）返回 Exif `Orientation` 标记的值，取八种可能取值之一。

  取值|说明
  :--|:--
  `1`|水平（正常）
  `2`|水平镜像
  `3`|旋转 180 度
  `4`|垂直镜像
  `5`|水平镜像并顺时针旋转 270 度
  `6`|顺时针旋转 90 度
  `7`|水平镜像并顺时针旋转 90 度
  `8`|顺时针旋转 270 度

  > [!TIP]
  > 要根据图像的 Exif 方向标记按需旋转和翻转图像，请使用 [`images.AutoOrient`][] 图像滤镜

`Exif`
: （`meta.Tags`）返回该图像可用的 Exif 字段集合。可用字段由 [`sources`][] 设置决定，具体字段由 [`fields`][] 设置管理，两者都在项目配置中设置。

`IPTC`
: （`meta.Tags`）返回该图像可用的 IPTC 字段集合。可用字段由 [`sources`][] 设置决定，具体字段由 [`fields`][] 设置管理，两者都在项目配置中设置。

`XMP`
: （`meta.Tags`）返回该图像可用的 XMP 字段集合。可用字段由 [`sources`][] 设置决定，具体字段由 [`fields`][] 设置管理，两者都在项目配置中设置。

## 示例

要列出创建日期、纬度、经度和方向：

```go-html-template
{{ with resources.GetMatch "images/featured.*" }}
  {{ if reflect.IsImageResourceWithMeta . }}
    {{ with .Meta }}
      <pre>
        {{ printf "%-25s %v\n" "Date" .Date }}
        {{ printf "%-25s %v\n" "Latitude" .Lat }}
        {{ printf "%-25s %v\n" "Longitude" .Long }}
        {{ printf "%-25s %v\n" "Orientation" .Orientation }}
      </pre>
    {{ end }}
  {{ end }}
{{ end }}
```

## 完整示例（实测）

测量条件：Hugo 0.167.0 extended，Windows，最小站点；`assets/images/exif.jpg` 是上游示例库中带 Exif 方向标记的 JPEG（方向值为 5）。放进 `layouts/_default/single.html`：

```go-html-template {file="layouts/_default/single.html"}
{{ with resources.Get "images/exif.jpg" }}
  {{ if reflect.IsImageResourceWithMeta . }}
    {{ with .Meta }}
      {{ if not .Date.IsZero }}<p>拍摄时间：{{ .Date.Format "2006-01-02" }}</p>{{ else }}<p>没有拍摄时间（零值）</p>{{ end }}
      <p>方向：{{ .Orientation }}</p>
      <p>纬度：{{ .Lat }}，经度：{{ .Long }}</p>
      <p>Exif 字段数：{{ len .Exif }}</p>
    {{ end }}
  {{ end }}
{{ end }}
```

Hugo 渲染为：

```html
<p>没有拍摄时间（零值）</p>
<p>方向：5</p>
<p>纬度：0，经度：0</p>
<p>Exif 字段数：2</p>
```

**你应当看到什么**：这张图只有 Exif 里的 `Orientation` 与 `YCbCrPositioning` 两个字段，所以 `len .Exif` 是 `2`。三个「缺失」的写法值得记住：

- `Date` 缺失时是**零值** `0001-01-01 00:00:00 +0000 UTC`，不是 `nil`。判断要写 `{{ if not .Date.IsZero }}`——`time.Time` 是结构体，`{{ with .Date }}` 永远为真；
- `Lat`/`Long` 缺失时是数字 `0`，不是 `nil`。想区分「赤道上的 0」和「没有 GPS」，只能看 `.Exif` 里有没有对应字段；
- `Exif` 缺失时是**空映射**（实测普通 JPEG 上 `not .Meta.Exif` 为 `true`），不会报错。

另外，用 `printf` 直接打印整套字段可以快速摸清一张图有什么（上游「示例」一节就是这么做的）：

```text
{{ printf "%v" .Meta.Exif }} → map[Orientation:5 YCbCrPositioning:1]
```

## 返回值边界（实测）

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| 带 Exif 的 JPEG | `Orientation`、`Exif` 有值（实测方向 5、2 个字段） | 否 |
| 没有元数据的 JPEG | 对象仍返回，`.Exif` 为空映射，`Date` 为零值，`Lat`/`Long` 为 `0` | 否 |
| ICO / SVG | `reflect.IsImageResourceWithMeta` 为 `false`（见下表）；此时调用 `.Meta` | 是：`does not support this method: use reflect.IsImageResource…` |
| 非图像资源（文本、CSS） | —— | 是：`does not support this method: use reflect.IsImageResource…` |
| 对**处理后的**资源调用 `.Meta` | 实测仍返回与源图相同的 `Orientation` 与字段数（元数据读自源文件）；但上游明确要求对原图调用，且发布出去的变换结果**不保证**带这些标记 | 否 |
| `resources.Get` 找不到文件（`nil`） | —— | 是：`nil pointer evaluating resource.Resource.Meta` |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 没报错但结果不对 | 输出 `0001-01-01` | `Date` 缺失时是零值，`with` 判不出来 | 用 `{{ if not .Date.IsZero }}` |
| 没报错但结果不对 | 把 `Lat`/`Long` 的 `0` 当成有效坐标 | 缺失即 `0`，与「真的在 0 度」不可区分 | 先确认 `.Exif` 里有 GPS 字段再取值 |
| 报错看不懂 | `does not support this method` | 该格式不支持元数据（如 SVG、ICO），或对象根本不是图像 | 先用 `reflect.IsImageResourceWithMeta` 判断，见下表 |
| 没报错但结果不对 | 变换后的图读不到新元数据 | 元数据属于源文件 | 对原始图像资源调用 `Meta` |
| 页面显示方向不对 | 手机竖拍的照片躺倒 | 只看元数据、没做旋转 | 用 [`images.AutoOrient`][] 滤镜按 `Orientation` 自动校正 |

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

[Exif]: https://en.wikipedia.org/wiki/Exif
[IPTC]: https://en.wikipedia.org/wiki/IPTC_Information_Interchange_Model
[XMP]: https://en.wikipedia.org/wiki/Extensible_Metadata_Platform
[`fields`]: /configuration/imaging/#fields
[`images.AutoOrient`]: /functions/images/autoorient/
[`reflect.IsImageResource`]: /functions/reflect/isimageresource/
[`reflect.IsImageResourceProcessable`]: /functions/reflect/isimageresourceprocessable/
[`reflect.IsImageResourceWithMeta`]: /functions/reflect/isimageresourcewithmeta/
[`sources`]: /configuration/imaging/#sources
[`time.Format`]: /functions/time/format/
