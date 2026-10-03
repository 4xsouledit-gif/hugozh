+++
title = "Colors"
linkTitle = "Colors"
description = "用简易直方图方法返回图像最主要颜色的切片，从最主要到最次要排序。"
date = 2026-10-02
weight = 10
source = "https://gohugo.io/methods/resource/colors/"

[params.functions_and_methods]
signatures = ["RESOURCE.Colors"]
returnType = "[]images.Color"
+++

> [!NOTE]
> 该方法可用于全局资源、页面资源或远程资源。

## 这一页解决什么问题

`Colors` 方法返回[processable image](g)（可处理的图像）中最主要颜色的切片，从最主要到最次要排序。它的用途是**让页面的配色跟着图片走**：用图里最暗的颜色做边框、用最亮和最暗的颜色拼一个文字框、把主色交给别的图像滤镜当背景色。

> [!NOTE]
> 用 [`reflect.IsImageResourceProcessable`][] 函数判断图像是否可处理。

返回的每一项都是一个颜色对象，带 `ColorHex` 与 `Luminance` 两个方法；把它直接放进模板输出（`{{ . }}`）会渲染成十六进制颜色值（实测：`{{ range first 1 .Colors }}{{ . }}{{ end }}` → `#523c33`）。

## 什么时候用，什么时候别用

**该用**：

- 需要从图片里**自动取一个颜色**去配文字、边框、占位背景；
- 需要按「主要程度」或「明暗」排序后取第一个（`index (sort .Colors "Luminance") 0`）；
- 需要算 WCAG 对比度，判断这组前景/背景色是否合规。

**别用**：

- 只想知道图片的**尺寸** → 用 [`Width`](/methods/resource/width/) / [`Height`](/methods/resource/height/)；
- 想把图片变成灰阶、去色 → 用 [`Filter`](/methods/resource/filter/) 配 `images.Grayscale`；
- 想按像素精确读取某个坐标的颜色 → `Colors` 是直方图统计，不提供坐标查询；
- 大图只要颜色、不要整张图 → 先 `Resize` 缩小再取色（上游建议；实测 `.Colors` 会返回 5 种颜色，缩小后的图更快且主色基本一致）。

## 用法

该方法很快，但如果先把图像缩小，就可以从更小的资源中提取颜色，从而进一步提升性能。

### 方法

切片中的每种颜色都是一个对象，具有以下方法：

`ColorHex`
: （`string`）返回[十六进制颜色][]值，前缀为井号。

`Luminance`
: （`float64`）返回该颜色在 sRGB 色彩空间中的[相对亮度][]，取值范围为 `[0, 1]`。`0` 表示最暗的黑色，`1` 表示最亮的白色。

> [!NOTE]
> [`images.Dither`][]、[`images.Padding`][]、[`images.Text`][] 等图像滤镜既接受十六进制颜色值，也接受 `images.Color` 对象作为参数。Hugo 会把 `images.Color` 对象渲染为十六进制颜色值。

### 排序

下面这个刻意构造的例子创建一个图像主要颜色表，最主要的颜色排在最前，并显示每种主要颜色的相对亮度：

```go-html-template
{{ with resources.Get "images/a.jpg" }}
  <table>
    <thead>
      <tr>
        <th>Color</th>
        <th>Relative luminance</th>
      </tr>
    </thead>
    <tbody>
      {{ range .Colors }}
        <tr>
          <td>{{ .ColorHex }}</td>
          <td>{{ .Luminance | lang.FormatNumber 4 }}</td>
        </tr>
      {{ end }}
    </tbody>
  </table>
{{ end }}
```

Hugo 渲染为：

ColorHex|Relative luminance
:--|:--
`#bebebd`|`0.5145`
`#514947`|`0.0697`
`#768a9a`|`0.2436`
`#647789`|`0.1771`
`#90725e`|`0.1877`
`#a48974`|`0.2704`

要按主要程度排序，把最次要的颜色放在最前：

```go-html-template
{{ range .Colors | collections.Reverse }}
```

要按相对亮度排序，把最暗的颜色放在最前：

```go-html-template
{{ range sort .Colors "Luminance" }}
```

要按相对亮度排序，把最亮的颜色放在最前，下面两种写法都可以：

```go-html-template
{{ range sort .Colors "Luminance" | collections.Reverse }}
{{ range sort .Colors "Luminance" "desc" }}
```

## 示例

下面的示例用图像的主要颜色为页面元素设置样式。

### 图像边框

用最主要的颜色为图像添加 5 像素边框：

```go-html-template
{{ with resources.Get "images/a.jpg" }}
  {{ $mostDominant := index .Colors 0 }}
  {{ $filter := images.Padding 5 $mostDominant }}
  {{ with .Filter $filter }}
    <img src="{{ .RelPermalink }}" width="{{ .Width }}" height="{{ .Height }}" alt="">
  {{ end }}
{{ end }}
```

用最暗的主要颜色为图像添加 5 像素边框：

```go-html-template
{{ with resources.Get "images/a.jpg" }}
  {{ $darkest := index (sort .Colors "Luminance") 0 }}
  {{ $filter := images.Padding 5 $darkest }}
  {{ with .Filter $filter }}
    <img src="{{ .RelPermalink }}" width="{{ .Width }}" height="{{ .Height }}" alt="">
  {{ end }}
{{ end }}
```

### 深色背景上的浅色文字

创建一个文本框，其前景色与背景色分别取自图像最亮和最暗的主要颜色：

```go-html-template
{{ with resources.Get "images/a.jpg" }}
  {{ $darkest := index (sort .Colors "Luminance") 0 }}
  {{ $lightest := index (sort .Colors "Luminance" "desc") 0 }}
  <div style="background: {{ $darkest }};">
    <div style="color: {{ $lightest }};">
      <p>This is light text on a dark background.</p>
    </div>
  </div>
{{ end }}
```

### WCAG 对比度

上一个例子把浅色文字放在深色背景上，但这种配色是否符合 [WCAG][] 对[最低对比度][]或[增强对比度][]的要求？

WCAG 对[对比度][]的定义是：

$$contrast\ ratio = { L_1 + 0.05 \over L_2 + 0.05 }$$

其中 \(L_1\) 是最亮颜色的相对亮度，\(L_2\) 是最暗颜色的相对亮度。

计算对比度即可判断是否符合 WCAG：

```go-html-template
{{ with resources.Get "images/a.jpg" }}
  {{ $lightest := index (sort .Colors "Luminance" "desc") 0 }}
  {{ $darkest := index (sort .Colors "Luminance") 0 }}
  {{ $cr := div
    (add $lightest.Luminance 0.05)
    (add $darkest.Luminance 0.05)
  }}
  {{ if ge $cr 7.5 }}
    {{ printf "The %.2f contrast ratio conforms to WCAG Level AAA." $cr }}
  {{ else if ge $cr 4.5 }}
    {{ printf "The %.2f contrast ratio conforms to WCAG Level AA." $cr }}
  {{ else }}
    {{ printf "The %.2f contrast ratio does not conform to WCAG guidelines." $cr }}
  {{ end }}
{{ end }}
```

## 完整示例（实测）

测量条件：Hugo 0.167.0 extended，Windows，最小站点；`assets/images/a.jpg` 是一张 600×400 的 JPEG，`params` 无特殊设置。把下面的模板放进 `layouts/_default/single.html`（任何会渲染 HTML、且能访问 `assets/` 全局资源的模板都可以）：

```go-html-template {file="layouts/_default/single.html"}
{{ with resources.Get "images/a.jpg" }}
  {{ $darkest := index (sort .Colors "Luminance") 0 }}
  {{ $lightest := index (sort .Colors "Luminance" "desc") 0 }}
  <p>最暗 {{ $darkest.ColorHex }}，最亮 {{ $lightest.ColorHex }}</p>
  <ul>
    {{ range .Colors }}
      <li>{{ .ColorHex }} — {{ .Luminance | lang.FormatNumber 4 }}</li>
    {{ end }}
  </ul>
{{ end }}
```

Hugo 渲染为（`range` 每轮留下的空行已省略）：

```html
<p>最暗 #523c33，最亮 #c6cbd2</p>
<ul>
  <li>#523c33 — 0.0526</li>
  <li>#c6cbd2 — 0.5937</li>
  <li>#966a43 — 0.1720</li>
  <li>#5f92c9 — 0.2721</li>
  <li>#c09460 — 0.3323</li>
</ul>
```

**你应当看到什么**：同一张图、同一台机器，`Colors` 每次返回**同样顺序**的颜色（直方图算法是确定性的）；`Luminance` 是 `0`–`1` 之间的小数，越小越暗。这块图一共返回 5 种颜色——数量随图片内容变化，不要把它当成固定值。

## 返回值边界（实测）

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| 正常图像资源 | `[]images.Color`，按主要程度从高到低 | 否 |
| 对非图像资源（如 `text/plain`）调用 `.Colors` | —— | 是：`error calling Colors: resource "/quotations/kipling.txt" of media type "text/plain" does not support this method: use reflect.IsImageResource, reflect.IsImageResourceProcessable, or reflect.IsImageResourceWithMeta to check if the resource supports this method before calling it` |
| 对 `nil` 资源（`resources.Get` 找不到文件）调用 | —— | 是：`nil pointer evaluating resource.Resource.Colors` |
| `index .Colors 0` 而切片为空 | 未实测（上游未说明空图像会返回什么） | —— |

要避免前两类报错，先判断再调用：

```go-html-template
{{ with resources.Get "images/a.jpg" }}
  {{ if reflect.IsImageResourceProcessable . }}
    {{ range first 3 .Colors }}{{ .ColorHex }}{{ end }}
  {{ end }}
{{ end }}
```

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 报错看不懂 | `does not support this method: use reflect.IsImageResource...` | 把 `Colors` 用在了文本/CSS 等非图像资源上 | 先 `reflect.IsImageResourceProcessable`，或改用 `MediaType.MainType` 判断 |
| 没报错但结果不对 | 颜色顺序和自己肉眼判断的不一致 | `Colors` 是直方图统计，不是「人眼最主要」 | 需要「人眼感觉」时按 `Luminance` 排序后取用 |
| 报错看不懂 | `nil pointer evaluating resource.Resource.Colors` | `resources.Get` 没找到文件，返回 `nil`，`with` 之外调用就会崩 | 始终 `{{ with resources.Get "…" }}` 包住 |
| 性能 | 大图上取色慢 | 直接从原图统计 | 先 `{{ $small := .Resize "200x" }}` 再 `$small.Colors` |

更多排查入口见[故障排查](/troubleshooting/)。

[WCAG]: https://en.wikipedia.org/wiki/Web_Content_Accessibility_Guidelines
[`images.Dither`]: /functions/images/dither/
[`images.Padding`]: /functions/images/padding/
[`images.Text`]: /functions/images/text/
[`reflect.IsImageResourceProcessable`]: /functions/reflect/isimageresourceprocessable/
[增强对比度]: https://www.w3.org/WAI/WCAG22/quickref/?showtechniques=145#contrast-enhanced
[十六进制颜色]: https://developer.mozilla.org/en-US/docs/Web/CSS/hex-color
[对比度]: https://www.w3.org/TR/WCAG21/#dfn-contrast-ratio
[相对亮度]: https://www.w3.org/TR/WCAG21/#dfn-relative-luminance
[最低对比度]: https://www.w3.org/WAI/WCAG22/quickref/?showtechniques=145#contrast-minimum
