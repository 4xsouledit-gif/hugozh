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

`Colors` 方法返回[processable image](g)（可处理的图像）中最主要颜色的切片，从最主要到最次要排序。

> [!NOTE]
> 用 [`reflect.IsImageResourceProcessable`][] 函数判断图像是否可处理。

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
