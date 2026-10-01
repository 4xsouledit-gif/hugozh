+++
title = "图像处理"
linkTitle = "图像处理"
description = "介绍图像资源处理方法、成像配置以及响应式图片的生成方式。"
date = 2026-10-01
weight = 180
source = "https://gohugo.io/content-management/image-processing/"
+++

## 图像处理概览

Hugo 可以在构建过程中转换与分析图像。任何图片格式都能作为资源管理，但只有可处理的图像（processable image）才能用下文的方法转换；处理结果会写入缓存，以保证后续构建依旧很快。判断一张图片能否处理，用 `reflect.IsImageResourceProcessable` 函数。

## 捕获三种图像资源

要处理图像，先把它捕获为页面资源（page resource）、全局资源（global resource）或远程资源（remote resource）。

页面资源是与叶子包 `index.md` 放在同一目录的图片，用页面对象的 `.Resources` 取得：

```go-html-template
{{ $image := .Resources.Get "sunset.jpg" }}
```

全局资源放在项目的 `assets` 目录中，用 `resources.Get` 取得：

```go-html-template
{{ $image := resources.Get "images/sunset.jpg" }}
```

远程资源用 `resources.GetRemote` 按 URL 取得：

```go-html-template
{{ $image := resources.GetRemote "https://example.org/images/sunset.jpg" }}
```

相关概念见[页面资源](/content-management/page-resources/)。

## 渲染图像

捕获资源后，用 `.Permalink`、`.RelPermalink`、`.Width`、`.Height` 等方法把图片写进模板。资源不存在时，可以直接抛错，也可以用 `with` 跳过渲染：

```go-html-template
{{ with .Resources.GetMatch "sunset.jpg" }}
  <img src="{{ .RelPermalink }}" width="{{ .Width }}" height="{{ .Height }}" alt="">
{{ end }}
```

远程资源还可能取回失败，可用 `try` 区分错误与结果：

```go-html-template
{{ $url := "https://example.org/images/sunset.jpg" }}
{{ with try (resources.GetRemote $url) }}
  {{ with .Err }}
    {{ errorf "%s" . }}
  {{ else with .Value }}
    <img src="{{ .RelPermalink }}" width="{{ .Width }}" height="{{ .Height }}" alt="">
  {{ else }}
    {{ errorf "无法获取远程资源 %q" $url }}
  {{ end }}
{{ end }}
```

## 处理方法

处理方法作用于图像资源，Hugo 按需生成处理结果、写入缓存并返回一个新的资源对象：

```go-html-template
{{ with .Resources.Get "sunset.jpg" }}
  {{ with .Resize "400x" }}
    <img src="{{ .RelPermalink }}" width="{{ .Width }}" height="{{ .Height }}" alt="">
  {{ end }}
{{ end }}
```

可用的方法如下：

| 方法 | 作用 |
| --- | --- |
| `.Resize` | 按给定规格缩放，只给宽度或高度时保持宽高比 |
| `.Fit` | 缩放至完全放入给定尺寸，保持宽高比 |
| `.Fill` | 先按比例缩放再裁剪，填满给定尺寸 |
| `.Crop` | 按给定尺寸与锚点裁剪 |
| `.Filter` | 应用滤镜，如模糊、亮度、对比度等 |
| `.Process` | 用一条处理规格字符串完成缩放、裁剪、旋转与格式转换 |
| `.Colors` | 提取图像的主色调，按占比从高到低排列 |
| `.Meta` | 读取图像的 Exif、IPTC 与 XMP 元数据 |

`.Meta` 自 Hugo 0.155.3 起提供，可用 `reflect.IsImageResourceWithMeta` 先做判断，返回对象上可取日期、纬度、经度、方向（`.Date`、`.Lat`、`.Long`、`.Orientation`）等值；它取代了旧版的 `.Exif` 方法（自 0.155.0 起弃用）。规格字符串的常见写法有 `"600x"`（宽度固定、高度按比例）、`"x400"`（高度固定）与 `"600x400"`（目标尺寸）；`.Fill` 与 `.Crop` 还会用到锚点（anchor），它决定裁剪时保留图片的哪个部位。

注意：图像转换不会保留元数据，要读取元数据必须对原始图像资源调用 `.Meta`。

## 性能：缓存、回收与资源占用

Hugo 按需处理图像并把结果缓存到项目配置中文件缓存（file cache）指定的目录。若站点部署在 Netlify，可在配置中加入以下内容，让缓存在两次构建之间保留：

```toml
[caches]
  [caches.images]
    dir = ':cacheDir/images'
```

改动处理方法，或重命名、删除图片后，缓存里会留下不再使用的文件，可运行垃圾回收（garbage collection）清理并回收磁盘空间：

```bash
hugo build --gc
```

处理图像所需的时间与内存随图像尺寸增长，一张 `4032x2268` 的图片远比 `1920x1080` 的图片昂贵。若源图远大于实际发布尺寸，建议在构建之前先把它们缩小。

## 配置成像行为

站点级的默认行为写在项目配置的 `[imaging]` 区段中，该区段适用于所有图像格式，可参考[配置 Hugo](/configuration/)：

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
```

顶层设置的含义：

- `anchor`：裁剪或填充时使用的焦点，可取 `TopLeft`、`Top`、`TopRight`、`Left`、`Center`、`Right`、`BottomLeft`、`Bottom`、`BottomRight` 或 `Smart`，默认 `smart`，大小写不敏感；`smart` 借助 `muesli/smartcrop` 找出图像中最值得保留的区域。
- `bgColor`：把透明图像转换为不支持透明的格式（例如 PNG 转 JPEG）时填充的背景色，同时也是非正交旋转时空白区域的填充色，取值须为 RGB 十六进制颜色，默认 `#ffffff`。
- `resampleFilter`：缩放、适配或填充时计算新像素所用的算法，常用 `box`（默认）、`lanczos`、`catmullRom`、`mitchellNetravali`、`linear`、`nearestNeighbor`；追求画质可以逐一试换，代价是构建变慢。

顶层的 `quality`、`compression`、`hint` 三个键自 Hugo 0.163.0 起弃用，请改用各格式子区段中的同名键。AVIF 与 WebP 支持 `lossy`、`lossless` 两种 `compression`；`quality` 取 1 到 100 的整数，AVIF 默认 60、JPEG 与 WebP 默认 75，且不同格式的取值不可直接比较。WebP 的 `method` 取 0 到 6（默认 2），数值越大压缩效率与画质越好；`useSharpYuv` 默认 `false`，开启后优先保证锐度。

元数据的提取与过滤由 `[imaging.meta]` 控制：`fields` 用通配切片（glob slice）匹配需要保留的字段，默认排除 `ColorSpace`、`Exif`、`GPS`、`Resolution`、`WhiteBalance` 等技术字段，写成 `['**']` 可全部保留；`sources` 指定元数据来源，可取 `exif`、`iptc`、`xmp`，默认只取前两者。

## 生成响应式图片

把同一张图片按多个宽度分别处理，再写进 `srcset`，浏览器就会按视口大小自行选择合适的版本。先在各宽度上处理一次并保存结果，避免在模板里重复处理：

```go-html-template
{{ with .Resources.GetMatch "cover.jpg" }}
  {{ $small := .Resize "480x" }}
  {{ $medium := .Resize "960x" }}
  {{ $large := .Resize "1440x" }}
  <img
    src="{{ $large.RelPermalink }}"
    srcset="{{ $small.RelPermalink }} 480w,
            {{ $medium.RelPermalink }} 960w,
            {{ $large.RelPermalink }} 1440w"
    sizes="(max-width: 600px) 480px, 960px"
    width="{{ $large.Width }}"
    height="{{ $large.Height }}"
    alt="封面">
{{ end }}
```

首次构建会真正生成这些图片，之后的构建直接复用资源缓存，因此处理成本只付出一次。Markdown 正文中插入的图片，可以交给[渲染钩子](/render-hooks/)统一套用同样的处理逻辑。

## 相关主题

- [页面资源](/content-management/page-resources/)
- [渲染钩子](/render-hooks/)
- [内容管理](/content-management/)
