+++
title = "渲染钩子（render hook）"
linkTitle = "渲染钩子"
description = "覆盖标准 Markdown 渲染行为的模板。"
date = 2026-10-02
weight = 1120
source = "https://gohugo.io/quick-reference/glossary/render-hook/"

[params.teach]
difficulty = "参考"
prereq = ["在文档里遇到不认识的 Hugo 术语时查阅"]
outcomes = ["能判断某个 Markdown 元素的输出能否用渲染钩子改写，并知道钩子没生效时先检查什么"]
next = ["/render-hooks/introduction/"]
+++

渲染钩子（render hook）是覆盖标准 Markdown 渲染的 [template](g)。

参见：[渲染钩子](/render-hooks/)

## 为什么重要

默认的 Markdown 输出不够用时（图片要加 `loading="lazy"`、外链要加 `target="_blank"`、代码块要加标题栏），用渲染钩子接管对应元素的渲染，不必改写正文。钩子按元素类型分别定义在 `layouts/_markup/`，目录或文件名写错时 Hugo 不报错，页面只是继续输出默认 HTML——这是最容易误判「改了没生效」的一类问题。

延伸阅读：[渲染钩子简介](/render-hooks/introduction/)、[图片渲染钩子](/render-hooks/images/)
