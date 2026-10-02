+++
title = "资源类型（resource type）"
linkTitle = "资源类型"
description = "资源媒体类型的主要类型。"
date = 2026-10-02
weight = 1140
source = "https://gohugo.io/quick-reference/glossary/resource-type/"

[params.teach]
difficulty = "参考"
prereq = ["在文档里遇到不认识的 Hugo 术语时查阅"]
outcomes = ["能说出某个资源的资源类型，并知道按类型筛选写错时会看到空集合而不是报错"]
next = ["/methods/resource/resourcetype/"]
+++

资源类型（resource type）是资源 [media type](g) 的主要类型。Markdown、HTML、AsciiDoc、Pandoc、reStructuredText 和 Emacs Org Mode 等内容文件的资源类型为 `page`。其他资源类型包括 `image`、`text`、`video` 等。可以使用 `Resource` 对象上的 [`ResourceType`](/methods/resource/resourcetype/) 方法获取资源类型。

## 为什么重要

资源类型决定 `.ResourceType` 的返回值，也决定按类型筛选与分派处理时的归类：`.Resources.ByType "image"` 只挑出图片，`.md` 内容片段归 `page`、CSS 归 `text`。类型写错不会报错，只是筛出一个空集合，页面上表现为「图片一张都没渲染」。

延伸阅读：[ResourceType 方法](/methods/resource/resourcetype/)、[媒体类型配置](/configuration/media-types/)
