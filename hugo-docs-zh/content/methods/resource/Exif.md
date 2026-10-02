+++
title = "Exif"
linkTitle = "Exif"
description = "返回一个对象，其中包含受支持图像格式的 Exif 元数据。"
date = 2026-10-02
weight = 60
source = "https://gohugo.io/methods/resource/exif/"

[params.functions_and_methods]
signatures = ["RESOURCE.Exif"]
returnType = "meta.ExifInfo"
+++

**（0.155.0 起弃用）** 请改用 [`Meta`](/methods/resource/meta/) 方法。

## 这一页解决什么问题

`Exif` 曾经是从图片里读 Exif 元数据（拍摄时间、GPS、方向标记）的入口。0.155.0 起它被 [`Meta`](/methods/resource/meta/) 取代：`Meta` 一次覆盖 **Exif、IPTC、XMP** 三种元数据，并额外提供 `Orientation`、`Lat`、`Long`、`Date` 这些已经整理好的字段。

保留这一页的原因只有一个——**老项目和旧教程里还会遇到 `.Exif`**。如果你的项目从旧版本升上来，看到构建日志里那条弃用警告，就是它在提醒你换写法。

## 什么时候用，什么时候别用

- **新代码：用 [`Meta`](/methods/resource/meta/)，不要用 `Exif`。** `Meta` 的字段更全、更稳定，能表达「这个格式是否支持元数据」。
- **维护老项目：** 0.167.0 上 `.Exif` 仍然可用（实测），但每次构建都会打印一条 `WARN deprecated:`，未来版本会移除；既然要动，顺手换掉。
- **不能靠它判断「格式是否支持元数据」**：返回对象永远存在，元数据缺失时只是空的（见下文边界表），所以要判断支持性用 [`reflect.IsImageResourceWithMeta`](/functions/reflect/isimageresourcewithmeta/)。
- **不要用它读 IPTC / XMP**：那是 `Meta` 才有的部分。

## 完整示例（实测）

测量条件：Hugo 0.167.0 extended，Windows；`assets/images/exif.jpg` 取自上游示例库、带 Exif 方向标记的 JPEG。放进 `layouts/_default/single.html`：

```go-html-template {file="layouts/_default/single.html"}
{{ with resources.Get "images/exif.jpg" }}
  {{ with .Exif }}
    <p>Tags：{{ .Tags }}</p>
    <p>日期：{{ .Date }}</p>
  {{ end }}
{{ end }}
```

Hugo 渲染为（实测）：

```html
<p>Tags：map[Orientation:5 YCbCrPositioning:1]</p>
<p>日期：0001-01-01 00:00:00 +0000 UTC</p>
```

同时构建日志里出现：

```text
WARN deprecated: Image.Exif was deprecated in Hugo v0.155.0 and will be removed in a future release. Use Image.Meta, see https://gohugo.io/content-management/image-processing/#meta
```

**你应当看到什么**：`.Exif` 返回的对象有 `Date`、`Lat`、`Long`、`Tags` 四个字段，**`Tags` 才是 Exif 字段映射**；`Orientation` 不在顶层——写 `.Exif.Orientation` 会直接让构建失败（实测：`can't evaluate field Orientation in type *meta.ExifInfo`），要用 `index .Tags "Orientation"`。

换成 `Meta` 的等价写法，字段名更直观：

```go-html-template
{{ with resources.Get "images/exif.jpg" }}
  {{ with .Meta }}
    <p>方向：{{ .Orientation }}</p>
    <p>Exif 字段数：{{ len .Exif }}</p>
  {{ end }}
{{ end }}
```

实测输出为 `方向：5` 与 `Exif 字段数：2`。注意这张图的 `.Meta.Date` 仍是零值——判断「有没有拍摄时间」要用 `.Date.IsZero`，不能写 `{{ with .Date }}`（Go 的 `time.Time` 是结构体，永远为真）。

## 返回值边界（实测）

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| Hugo 0.167.0 调用 `.Exif` | 返回 `*meta.ExifInfo`（`Date`、`Lat`、`Long`、`Tags`），并打印弃用 WARN | 否 |
| 图片不含 Exif（普通 JPEG） | 返回的对象仍存在，`.Tags` 是空映射（实测 `not .Tags` 为 `true`） | 否 |
| 读 `.Exif.Orientation`（顶层字段） | —— | 是：`can't evaluate field Orientation in type *meta.ExifInfo` |
| GPS 缺失 | `.Lat`、`.Long` 为 `0`，不是 `nil` | 否 |
| 拍摄时间缺失 | `.Date` 为零值 `0001-01-01 00:00:00 +0000 UTC` | 否 |
| 非图像资源 | —— | 是：`does not support this method: use reflect.IsImageResource…` |
| `resources.Get` 找不到文件（`nil`） | —— | 是：`nil pointer evaluating resource.Resource.Exif` |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 构建日志有 WARN | `Image.Exif was deprecated in Hugo v0.155.0` | 用了弃用方法 | 按本页示例换成 `.Meta` |
| 报错看不懂 | `can't evaluate field Orientation in type *meta.ExifInfo` | `Orientation` 不在 `.Exif` 顶层 | 用 `.Meta.Orientation`，或 `index .Exif.Tags "Orientation"` |
| 没报错但结果不对 | 明明有 GPS 却读到 0 | 该格式/该图没有对应元数据，零值不等于「有值」 | 用 `reflect.IsImageResourceWithMeta` 先判断格式，再判断具体字段是否为零值 |
| 没报错但结果不对 | 对处理后的图读 Exif 读到旧值 | 元数据来自源文件 | 读元数据时始终用**原始**资源对象 |

更多排查入口见[故障排查](/troubleshooting/)。
