+++
title = "资源管道"
linkTitle = "资源管道"
description = "自动化处理并优化图片、样式表、JavaScript 等静态资源的机制。"
date = 2026-10-02
weight = 60
source = "https://gohugo.io/quick-reference/glossary/asset-pipeline/"

[params.teach]
difficulty = "参考"
prereq = ["在文档里遇到不认识的 Hugo 术语时查阅"]
outcomes = ["判断一份 CSS 或图片该放 assets/ 还是 static/，以及为什么改了文件线上不更新"]
next = ["/hugo-pipes/introduction/"]
+++

## 资源管道

_资源管道_（asset pipeline）是一种自动化并优化静态资源处理流程的系统，处理的资源（[resource](g)）包括图片、样式表和 JavaScript 文件。

## 为什么重要

同一份 CSS，放进 `assets/` 才会经过 Sass 编译、压缩与指纹处理，放进 `static/` 只是原样拷贝——这是「改了样式线上不更新」和「文件名没有哈希、浏览器缓存无法失效」最常见的分界。图片要生成多尺寸或 WebP，也必须先成为资源再走处理方法。想让文件进管道，先确认它在 `assets/` 下并能被 `resources.Get` 取到。

延伸阅读：[Hugo Pipes 简介](/hugo-pipes/introduction/) · [图像处理](/content-management/image-processing/)
