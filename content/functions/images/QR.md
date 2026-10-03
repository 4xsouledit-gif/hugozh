+++
title = "images.QR"
linkTitle = "QR"
description = "按指定选项把给定文本编码为二维码，返回一个包含该二维码的图像资源。"
date = 2026-10-02
weight = 210
source = "https://gohugo.io/functions/images/qr/"

[params.functions_and_methods]
signatures = ["images.QR TEXT [OPTIONS]"]
returnType = "images.ImageResource"
+++

**（0.141.0 新增）**

`images.QR` 函数按指定选项把给定文本编码为[二维码][]，返回一个图像资源。生成图像的尺寸取决于三个因素：

- 数据长度：文本越长，为容纳更大的信息密度就需要越大的图像。
- 纠错级别：纠错级别越高，二维码抗损毁能力越强，但通常需要略大的图像尺寸来保持可读性。
- 每模块像素数：分配给每个模块（二维码的最小单元）的图像像素数会直接影响整体图像尺寸。每模块像素数越多，图像越大、分辨率越高。

虽然默认选项值对多数场景已经够用，仍应在屏幕显示和打印两种情况下都测试渲染出的二维码。

## 选项

`images.QR` 函数接受一个选项映射（map）。

`level`
: （`string`）编码文本时使用的纠错级别，取 `low`、`medium`、`quartile` 或 `high` 之一。默认为 `medium`。

  纠错级别|冗余度
  :--|:--
  low|20%
  medium|38%
  quartile|55%
  high|65%

`scale`
: （`int`）每个二维码模块对应的图像像素数。必须大于或等于 `2`。默认为 `4`。

`targetDir`
: （`string`）Hugo 存放所生成图像的 [`publishDir`][] 子目录。路径分隔使用 Unix 风格斜杠（`/`）。若为空或未提供，图像直接放在 `publishDir` 根目录下。子目录不存在时 Hugo 会自动创建。

## 示例

用 `level` 和 `scale` 的默认值创建二维码：

```go-html-template
{{ $text := "https://gohugo.io" }}
{{ with images.QR $text }}
  <img src="{{ .RelPermalink }}" width="{{ .Width }}" height="{{ .Height }}" alt="">
{{ end }}
```

英文原文在此处用自带的 `qr` 短代码渲染了一个指向 `https://gohugo.io` 的二维码示例；本站未收录该示例。

按需指定 `level`、`scale` 和 `targetDir` 以得到期望结果：

```go-html-template
{{ $text := "https://gohugo.io" }}
{{ $opts := dict
  "level" "high"
  "scale" 3
  "targetDir" "images/qr"
}}
{{ with images.QR $text $opts }}
  <img src="{{ .RelPermalink }}" width="{{ .Width }}" height="{{ .Height }}" alt="">
{{ end }}
```

英文原文在此处渲染了一个 `level` 为 `high`、`scale` 为 `3`、输出到 `images/qr` 的二维码示例；本站未收录该示例。

插入一个指向当前页面 `Permalink` 的二维码：

```go-html-template {file="layouts/page.html"}
{{ with images.QR .Permalink }}
  <img
    src="{{ .RelPermalink }}"
    width="{{ .Width }}"
    height="{{ .Height }}"
    alt="QR code linking to {{ $.Permalink }}"
    class="qr-code"
    loading="lazy"
  >
{{ end }}
```

然后用 CSS 在非打印场景下隐藏该二维码：

```css
/* Hide QR code by default */
.qr-code {
  display: none;
}

/* Show QR code when printing */
@media print {
  .qr-code {
    display: block;
  }
}
```

## 尺寸（scale）

二维码越小，设备能够可靠扫描它的最远距离也越短。

上面的示例中我们把 `scale` 设为 `2`，得到每个模块由 2x2 像素组成的二维码。这在屏幕显示时或许够用，但以 600 dpi 打印时很可能出问题。

```text
\[ \frac{2\:px}{module} \times \frac{1\:inch}{600\:px} \times \frac{25.4\:mm}{1\:inch} = \frac{0.085\:mm}{module} \]
```

该模块尺寸只有通常建议的最小值 0.170 mm 的一半。\
若二维码需要打印，请使用默认的 `scale` 值，即每模块 4 像素。

不要用 Hugo 的图像处理方法来缩放二维码。当二维码模块占据非整数个像素时，缩放会因抗锯齿而产生模糊。

> [!NOTE]
> 始终要在屏幕显示和打印两种情况下测试渲染出的二维码。

## 短代码

调用 `qr` 短代码可以把二维码插入正文。

用自闭合写法把文本作为参数传入：

```md
{{</* qr text="https://gohugo.io" /*/>}}
```

也可以把文本写在开闭标记之间：

```md
{{</* qr */>}}
https://gohugo.io
{{</* /qr */>}}
```

`qr` 短代码接受包括 `level` 和 `scale` 在内的多个参数，详见[相关文档][]。

[`publishDir`]: /configuration/all/#publishdir
[二维码]: https://en.wikipedia.org/wiki/QR_code
[相关文档]: /shortcodes/qr/
