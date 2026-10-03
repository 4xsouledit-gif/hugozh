+++
title = "全局资源（global resource）"
linkTitle = "全局资源"
description = "`assets` 目录中，或挂载到该目录的任何目录中的文件。"
date = 2026-10-02
weight = 500
source = "https://gohugo.io/quick-reference/glossary/global-resource/"

[params.teach]
difficulty = "参考"
prereq = ["在文档里遇到不认识的 Hugo 术语时查阅"]
outcomes = ["能分清全局资源与页面资源，并判断一份 CSS/图片该放在哪里、用什么函数取"]
next = ["/hugo-pipes/introduction/"]
+++

全局资源（global resource）是 `assets` 目录中的文件，或是挂载到 `assets` 目录的任何目录中的文件。

## 为什么重要

`assets` 目录里的文件不会按原路径发布，必须先用 `resources.Get` 或 `resources.GetMatch` 取到再处理或输出；直接写 `/assets/style.css` 这样的链接，本地也许还能点开，构建后必然 404。它和[page resource](g)（页面资源）的取法不同：页面资源挂在具体页面下（用 `.Resources`），全局资源从项目级取，把两者搞混时函数返回 nil，随后对 nil 继续处理就会报错或静默输出空内容。

延伸阅读：[Hugo Pipes 简介](/hugo-pipes/introduction/)、[页面资源](/content-management/page-resources/)
