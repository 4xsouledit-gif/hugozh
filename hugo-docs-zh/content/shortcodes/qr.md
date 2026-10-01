+++
title = "qr"
linkTitle = "qr"
description = "用 qr 短代码把文本编码为二维码图片并插入正文。"
date = 2026-10-01
weight = 70
source = "https://gohugo.io/shortcodes/qr/"
+++

> [!NOTE]
> 若要覆盖 Hugo 内置的 `qr` 短代码，请把[源代码][]复制到 `layouts/_shortcodes` 目录下同名文件中。

`qr` 短代码按指定选项把给定的文本编码为[二维码][]，并渲染出对应的图片。自 Hugo 0.141.0 起可用。生成的图片会写入发布目录（`publishDir`）下的子目录，正文中得到的是一个引用该图片的 `img` 元素，因此二维码可以用于网址、电话号码或名片等需要被手机扫描的场景。

短代码在内部调用 `images.QR` 函数，涉及图片资源的生成规则与处理方式可参阅[图像处理](/content-management/image-processing/)。

## 示例

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

为电话号码生成二维码：

```md
{{</* qr text="tel:+12065550101" /*/>}}
```

下面的例子用较低的纠错级别、较大的模块尺寸，为 [vCard][] 格式的联系人信息生成二维码：

```md
{{</* qr level="low" scale=2 alt="QR code of vCard for John Smith" */>}}
BEGIN:VCARD
VERSION:2.1
N;CHARSET=UTF-8:Smith;John;R.;Dr.;PhD
FN;CHARSET=UTF-8:Dr. John R. Smith, PhD.
ORG;CHARSET=UTF-8:ABC Widgets
TITLE;CHARSET=UTF-8:Vice President Engineering
TEL;TYPE=WORK:+12065550101
EMAIL;TYPE=WORK:jsmith@example.org
END:VCARD
{{</* /qr */>}}
```

## 参数

| 参数名 | 类型 | 说明 |
| --- | --- | --- |
| `text` | `string` | 要编码的文本；未提供时取开闭标记之间的文本。 |
| `level` | `string` | 编码文本时使用的纠错级别，取值为 `low`、`medium`、`quartile` 或 `high` 之一。默认值为 `medium`。 |
| `scale` | `int` | 每个二维码模块对应的图片像素数。必须大于或等于 2。默认值为 `4`。 |
| `targetDir` | `string` | 发布目录（`publishDir`）下用于存放所生成图片的子目录。 |
| `alt` | `string` | `img` 元素的 `alt` 属性。 |
| `class` | `string` | `img` 元素的 `class` 属性。 |
| `id` | `string` | `img` 元素的 `id` 属性。 |
| `loading` | `string` | `img` 元素的 `loading` 属性，取值为 `eager` 或 `lazy`。 |
| `title` | `string` | `img` 元素的 `title` 属性。 |

纠错级别越高，二维码在被遮挡或污损时越容易被识别，但同样内容所需的模块也越多。`scale` 控制最终图片的边长，数值越大图片越清晰，文件也越大。

[二维码]: https://en.wikipedia.org/wiki/QR_code
[vCard]: https://en.wikipedia.org/wiki/VCard
[源代码]: https://github.com/gohugoio/hugo/blob/master/tpl/tplimpl/embedded/templates/_shortcodes/qr.html
