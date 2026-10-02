+++
title = "Resource 方法"
linkTitle = "Resource"
description = "在全局资源、页面资源或远程资源对象上使用这些方法。"
date = 2026-10-02
weight = 80
source = "https://gohugo.io/methods/resource/"
+++

## 这一页解决什么问题

Hugo 把 `assets/` 目录里的文件、页面包（leaf bundle）里的文件，以及 `resources.GetRemote` 抓回来的文件统一称作 **Resource 对象**。这些方法就是「拿到这个对象之后能对它做什么」的清单：读出它的名字、类型、内容、尺寸、元数据，对它做图像变换，或者把它发布到 `public`。

读懂本章的关键是先分清资源的**三种来源**——同一个方法在不同来源上返回值可能不同，个别方法只对其中一两种来源有效：

| 来源 | 怎么拿到 | 典型限制 |
| --- | --- | --- |
| [global resource](g)（全局资源） | `resources.Get` / `resources.GetMatch` | 路径相对 `assets/` 目录 |
| [page resource](g)（页面资源） | `.Resources.Get` / `.Resources.Match` | 路径相对页面包；可带前置元数据里声明的 `name`、`title`、`params` |
| [remote resource](g)（远程资源） | `resources.GetRemote` | 需要联网；`Name`、`Title` 是带哈希的文件名 |

## 读完本章你应该能够

- 判断一个方法能不能用在手头的资源上（例如 `Params` 只对页面资源有意义）；
- 读出图像资源的宽高、媒体类型、主要颜色与元数据，并在取值前做存在性判断；
- 用 `Resize`、`Fit`、`Fill`、`Crop`、`Filter`、`Process` 之一完成图像变换，并说清它们之间怎么选；
- 知道什么情况下资源是 `nil`、方法会返回零值还是直接让构建失败。

## 阅读顺序

先认脸，再取内容，最后变换与发布：

1. **识别资源**：[Name](/methods/resource/name/) → [Title](/methods/resource/title/) → [ResourceType](/methods/resource/resourcetype/) → [MediaType](/methods/resource/mediatype/)；
2. **取内容与元数据**：[Content](/methods/resource/content/) → [Params](/methods/resource/params/) → [Data](/methods/resource/data/) → [Meta](/methods/resource/meta/) → [Colors](/methods/resource/colors/)；
3. **输出与发布**：[RelPermalink](/methods/resource/relpermalink/) → [Permalink](/methods/resource/permalink/) → [Publish](/methods/resource/publish/)；
4. **图像变换**：[Width](/methods/resource/width/) / [Height](/methods/resource/height/)（读取尺寸）→ [Resize](/methods/resource/resize/) / [Fit](/methods/resource/fit/) / [Fill](/methods/resource/fill/) / [Crop](/methods/resource/crop/) → [Filter](/methods/resource/filter/) → [Process](/methods/resource/process/)（一条字符串完成多种变换）；
5. **已弃用**：[Err](/methods/resource/err/)（0.141.0 已移除）、[Exif](/methods/resource/exif/)（0.155.0 弃用，改用 `Meta`）——只在维护老项目时查看。

只做常规图像处理的话，先读 [图像处理](/content-management/image-processing/) 一章，再回来查具体方法的边界。
