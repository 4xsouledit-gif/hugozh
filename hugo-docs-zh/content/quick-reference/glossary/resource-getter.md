+++
title = "资源获取器（resource getter）"
linkTitle = "资源获取器"
description = "为基于路径的查找提供资源的对象。"
date = 2026-10-02
weight = 1130
source = "https://gohugo.io/quick-reference/glossary/resource-getter/"

[params.teach]
difficulty = "参考"
prereq = ["在文档里遇到不认识的 Hugo 术语时查阅"]
outcomes = ["能判断什么时候必须给管线函数传资源获取器，以及 import 失败时该检查哪一项"]
next = ["/methods/page/resources/"]
+++

资源获取器（resource getter）为基于路径的查找提供资源。常见的资源获取器包括：

- 资源切片，例如 `slice $resource1 $resource2`
- [`Resources.Mount`][] 的返回值

## 为什么重要

资源获取器是「按路径找资源」的上下文：`css.Sass`、`css.PostCSS`、`js.Build` 的 `importContext` 选项都要求传入它，Hugo 用它解析 `@import`、`@use` 与 `import` 语句，找不到才回退到文件系统。不传这个上下文时，模块挂载进来的 Sass/JS 往往 import 不到，现象是「文件明明存在却报找不到」。`Resources.Mount` 的返回值就是最常用的资源获取器。

延伸阅读：[Resources.Mount](/methods/page/resources/#mount)、[Sass 转 CSS](/hugo-pipes/transpile-sass-to-css/)

[`Resources.Mount`]: /methods/page/resources/#mount
