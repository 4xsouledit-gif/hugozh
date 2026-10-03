+++
title = "资源（resource）"
linkTitle = "资源"
description = "构建过程使用、用于补充或生成内容、结构、行为或呈现的任何文件。"
date = 2026-10-02
weight = 1150
source = "https://gohugo.io/quick-reference/glossary/resource/"

[params.teach]
difficulty = "参考"
prereq = ["在文档里遇到不认识的 Hugo 术语时查阅"]
outcomes = ["能判断一份文件该放进 `assets/`、`static/` 还是页面包里，并知道放错后会失去哪些处理能力"]
next = ["/hugo-pipes/introduction/"]
+++

资源（resource）是构建过程使用、用于补充或生成内容、结构、行为或呈现的任何文件。例如：图像、视频、内容片段、CSS、Sass、JavaScript 和数据。

Hugo 支持三种类型的资源：[global resources](g)、[page resources](g) 和 [remote resources](g)。

## 为什么重要

资源是 Hugo Pipes 的输入：先通过 `resources.Get`、`resources.GetRemote`、`.Resources.Get` 或 `.Resources.Match` 拿到 Resource 对象，之后才能缩放、转译、压缩、指纹化。放进 `static/` 的文件虽然也能访问，但只会被原样复制，拿不到 `.Width`、`.Permalink` 等方法，也无法参与处理。

延伸阅读：[Hugo Pipes 简介](/hugo-pipes/introduction/)、[页面资源](/content-management/page-resources/)
