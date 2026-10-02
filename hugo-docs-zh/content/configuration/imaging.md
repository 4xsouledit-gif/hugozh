+++
title = "图像处理配置"
linkTitle = "图像处理配置"
description = "配置图像处理的对齐锚点、重采样与各格式编码参数。"
date = 2026-10-01
weight = 100
source = "https://gohugo.io/configuration/imaging/"
+++

## 这一页解决什么问题

`[imaging]` 决定 Hugo 处理图片时使用的默认参数：裁剪焦点（`anchor`）、缩放算法（`resampleFilter`），以及各格式的编码质量（`quality`、`compression`、`hint`、`method`）。

**最容易踩的坑**：改了这些默认值**不会自动重做已经处理过的图片**——旧结果还在资源缓存里，需要 `--ignoreCache` 或清理缓存才会重新生成（见[缓存配置](/configuration/caches/)）。

## 什么时候需要这些设置

| 设置 | 什么时候需要 | 改错了会看到什么现象 |
| --- | --- | --- |
| `anchor` | 裁剪时希望保留画面重点（默认 `smart` 自动判断） | 改成固定锚点后，同一张图在不同尺寸下的构图会明显变化 |
| `resampleFilter` | 在画质与构建耗时之间取舍（默认 `box` 最快） | 换用 `lanczos` 等高质量滤波器 → 图片更锐利但构建更慢；改完必须重新生成图片 |
| `jpeg.quality` / `webp.quality` / `avif.quality` | 控制体积与画质的平衡 | 质量值不能跨格式直接比较（上游明确：AVIF 的 `60` 观感接近 JPEG 的 `75`）；调得过低会出现明显色块 |
| `avif.encoderSpeed` | AVIF 构建太慢或文件太大 | 取值 `1`–`10`，越小文件越小、构建越慢；上游提示小于 `5` 可能显著延长构建时间 |
| `webp.method` | WebP 压缩率与速度的取舍 | 取值 `0`–`6`，越小编码越快 |
| `meta.sources` / `meta.fields` | 用 `Meta` 方法读取图片元数据 | 默认排除 XMP（为性能）；不显式加入就取不到该类字段 |
| `exif.excludeFields` / `includeFields` | 提取或屏蔽特定 Exif 字段 | 正则写错 → 字段**静默**缺失或多出，不报错 |

**什么时候别用**：不要为了单张图片的问题去改全局 `imaging` 默认值——处理规格（`.Resize`、`.Fit` 等调用参数）可以就地指定，影响面更小。

处理图像时的默认设置如下：

```toml
[imaging]
anchor = 'smart'
bgColor = '#ffffff'
resampleFilter = 'box'

[imaging.avif]
compression = 'lossy'
encoderSpeed = 10
hint = 'photo'
quality = 60

[imaging.jpeg]
quality = 75

[imaging.webp]
compression = 'lossy'
hint = 'photo'
method = 2
quality = 75
useSharpYuv = false

[imaging.exif]
disableDate = false
disableLatLong = false
excludeFields = 'GPS|Exif|Exposure[M|P|B]|Contrast|Resolution|Sharp|JPEG|Metering|Sensing|Saturation|ColorSpace|Flash|WhiteBalance'
includeFields = ''

[imaging.meta]
sources = ['exif', 'iptc']
fields = ['! *{GPS,Exif,Exposure[MPB],Contrast,Resolution,Sharp,JPEG,Metering,Sensing,Saturation,ColorSpace,Flash,WhiteBalance}*']
```

## 顶层设置

以下设置对所有图像格式生效。

键名|类型|默认值|说明
:--|:--|:--|:--
`anchor`|`string`|`smart`|裁剪或填充图像时的焦点位置。大小写不敏感，可选 `TopLeft`、`Top`、`TopRight`、`Left`、`Center`、`Right`、`BottomLeft`、`Bottom`、`BottomRight` 或 `Smart`。`Smart` 使用 [`muesli/smartcrop`](https://github.com/muesli/smartcrop) 包找出图像中最有趣的区域。
`bgColor`|`string`|`#ffffff`|把透明图像转换为不支持透明的格式（例如 PNG 转 JPEG）时使用的背景色。当把图像旋转非正交角度、且该区域不透明且处理规格中未指定背景色时，也用该颜色填充产生的空白区域。取值必须为 RGB [十六进制颜色](https://developer.mozilla.org/en-US/docs/Web/CSS/hex-color)。
`compression`|`string`|—|（自 v0.163.0 起弃用）请改用格式专属的 `compression` 设置，适用于 [AVIF](#avif) 与 [WebP](#webp) 图像。
`hint`|`string`|—|（自 v0.163.0 起弃用）请改用格式专属的 `hint` 设置，适用于 [AVIF](#avif) 与 [WebP](#webp) 图像。
`quality`|`int`|—|（自 v0.163.0 起弃用）请改用格式专属的 `quality` 设置，适用于 [AVIF](#avif)、[JPEG](#jpeg) 与 [WebP](#webp) 图像。
`resampleFilter`|`string`|`box`|缩放、适配或填充图像时计算新像素所用的算法。大小写不敏感，常用取值包括 `box`、`lanczos`、`catmullRom`、`mitchellNetravali`、`linear`、`nearestNeighbor`。

各重采样滤波器的特点：

滤波器|说明
:--|:--
`box`|简单快速的均值滤波器，适合缩小图像
`lanczos`|高质量重采样滤波器，适合照片，结果锐利
`catmullRom`|锐利的立方滤波器，比 Lanczos 更快而效果相近
`mitchellNetravali`|立方滤波器，结果更平滑，振铃伪影少于 CatmullRom
`linear`|双线性重采样滤波器，输出平滑，比立方滤波器更快
`nearestNeighbor`|最快，无抗锯齿

可用重采样滤波器的完整列表参见[源码文档](https://github.com/disintegration/imaging#image-resizing)。若愿意用性能换取画质，可以试试其他滤波器。

## AVIF

自 v0.162.0 起可用。

以下设置在对 AVIF 图像编码时生效。

> 从 Lightroom 导出 HDR AVIF 图像时，在导出对话框的 File Settings 下取消勾选 Maximize Compatibility，可提升 Hugo 的 AVIF 解码速度。

> 把动画图像编码为 AVIF 会得到单帧（静态）图像。把动画 AVIF 转换为 GIF 等其他格式则工作正常。

```toml
[imaging.avif]
compression = 'lossy'
encoderSpeed = 10
hint = 'photo'
quality = 60
```

键名|类型|默认值|说明
:--|:--|:--|:--
`compression`|`string`|`lossy`|（自 v0.163.0 起）编码策略，可选 `lossy` 或 `lossless`。
`encoderSpeed`|`int`|`10`|编码器速度，取值 `1`–`10` 的整数，等价于 [`avifenc`](https://github.com/aomediacodec/libavif) 命令行的 `-s` 标志。数值越小文件越小，构建耗时越长。在常见的 Web 图像尺寸下，各档位的画质难以区分。小于 `5` 的值可能显著延长构建时间。
`hint`|`string`|`photo`|（自 v0.163.0 起）内容提示。可选 `drawing`、`icon`、`photo`、`picture` 或 `text`。使用 `photo` 与 `picture` 时 Hugo 采用 `4:2:0` 色度子采样，其余取值使用 `4:4:4`。
`quality`|`int`|`60`|（自 v0.163.0 起）使用 `lossy` 压缩时的视觉保真度，取值 `1`–`100` 的整数。数值越小文件越小，数值越大画面越清晰。质量值因编码器而异，不能跨格式直接比较：AVIF 的 `60` 在观感上接近 JPEG 的 `75`。

`hint` 的取值含义：

取值|示例
:--|:--
`drawing`|对比度细节丰富的手绘或线稿
`icon`|小尺寸彩色图像
`photo`|自然光照下的户外照片
`picture`|室内照片，例如人像
`text`|以文字为主的图像

## JPEG

自 v0.163.0 起可用。

以下设置在对 JPEG 图像编码时生效。

```toml
[imaging.jpeg]
quality = 75
```

键名|类型|默认值|说明
:--|:--|:--|:--
`quality`|`int`|`75`|视觉保真度，取值 `1`–`100` 的整数。数值越小文件越小，数值越大画面越清晰。

## WebP

自 v0.155.0 起可用。

以下设置在对 WebP 图像编码时生效。

```toml
[imaging.webp]
compression = 'lossy'
hint = 'photo'
method = 2
quality = 75
useSharpYuv = false
```

键名|类型|默认值|说明
:--|:--|:--|:--
`compression`|`string`|`lossy`|（自 v0.163.0 起）编码策略，可选 `lossy` 或 `lossless`。
`hint`|`string`|`photo`|内容提示，等价于 [`cwebp`](https://developers.google.com/speed/webp/docs/cwebp) 命令行的 `-preset` 标志。可选 `drawing`、`icon`、`photo`、`picture` 或 `text`。
`method`|`int`|`2`|压缩算法的投入程度，取值 `0`–`6` 的整数，等价于 [`cwebp`](https://developers.google.com/speed/webp/docs/cwebp) 命令行的 `-m` 标志。数值越小处理越快，数值越大压缩率与画质越好。
`quality`|`int`|`75`|（自 v0.163.0 起）使用 `lossy` 压缩时的视觉保真度，取值 `1`–`100` 的整数。数值越小文件越小，数值越大画面越清晰。
`useSharpYuv`|`bool`|`false`|RGB 转 YUV 时使用的转换方法，等价于 [`cwebp`](https://developers.google.com/speed/webp/docs/cwebp) 命令行的 `-sharp_yuv` 标志。启用后优先保证锐度，牺牲处理速度。

`hint` 的取值含义与 [AVIF](#avif) 一节相同。

## Exif 方法

自 v0.155.0 起弃用，请改用 `Meta` 方法。

以下参数用于控制 Exif 元数据的提取与过滤：

键名|类型|默认值|说明
:--|:--|:--|:--
`disableDate`|`bool`|`false`|是否禁用日期与时间元数据（例如 Exif 的 `DateTimeOriginal`）的提取。
`disableLatLong`|`bool`|`false`|是否禁用经纬度（GPS 坐标）元数据的提取。
`excludeFields`|`string`|`GPS\|Exif\|Exposure[M\|P\|B]\|Contrast\|Resolution\|Sharp\|JPEG\|Metering\|Sensing\|Saturation\|ColorSpace\|Flash\|WhiteBalance`|正则表达式，匹配提取时要排除的 Exif 字段名。
`includeFields`|`string`|空字符串（`''`）|正则表达式，匹配提取时要包含的 Exif 字段名，为空时不按字段名筛选。

## Meta 方法

自 v0.155.0 起可用。

使用 `Meta` 方法时，以下参数用于控制 Hugo 提取与过滤元数据的方式，便于在数据粒度与构建性能之间取得平衡。

键名|类型|默认值|说明
:--|:--|:--|:--
`fields`|`[]string`|排除技术性元数据后的默认集合|匹配要提取的字段的 glob 切片。为空时使用一套排除技术性元数据的默认集合。设为 `['**']` 可包含所有字段。
`sources`|`[]string`|`['exif', 'iptc']`|要包含的元数据来源，取 `exif`、`iptc`、`xmp` 中的一个或多个。默认排除 XMP 元数据以提升性能。

> 为提升性能并减小缓存体积，Hugo 默认排除以下字段：`ColorSpace`、`Contrast`、`Exif`、`ExposureBias`、`ExposureMode`、`ExposureProgram`、`Flash`、`GPS`、`JPEG`、`Metering`、`Resolution`、`Saturation`、`Sensing`、`Sharp`、`WhiteBalance`。

相关处理方法见[图像处理](/content-management/image-processing/)。

## 常见坑

| 症状 | 真因 | 怎么修 |
| --- | --- | --- |
| 改了 `quality` / `anchor`，页面上的图没变化 | 已处理过的图片命中了资源缓存 | 用 `hugo --ignoreCache` 构建对照，或清理 `resources/_gen` 与缓存目录 |
| 构建时间突然变长 | `avif.encoderSpeed` 小于 `5`，或换用了高质量的 `resampleFilter` | 调回较大值或较快的滤波器；AVIF 只用在确实需要的图上 |
| 图片出现明显色块或糊 | `quality` 设得过低，或编码策略与质量值搭配不当 | 逐档对比一次；质量值不要跨格式照搬 |
| 读不到某些元数据字段 | `meta.sources` 默认只含 `exif` 与 `iptc`（排除 XMP），`meta.fields` 另有默认排除集合 | 显式扩展 `sources` / `fields`；见[图像处理](/content-management/image-processing/)中的 `Meta` 方法 |
| 动画图转成 AVIF 后不动了 | 上游明确：把动画图像编码为 AVIF 会得到单帧静态图 | 这是已知行为；改用 GIF 或保留原格式 |
| 报错看不懂 | 该分区多数不报错，症状是「图片效果或元数据不对」 | 见[故障排查](/troubleshooting/) |

更多排查入口见[故障排查](/troubleshooting/)。
