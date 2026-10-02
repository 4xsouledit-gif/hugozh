+++
title = "媒体类型（media type）"
linkTitle = "媒体类型"
description = "表示文件格式与传输内容的两段式标识符，例如 `text/html`。"
date = 2026-10-02
weight = 760
source = "https://gohugo.io/quick-reference/glossary/media-type/"

[params.teach]
difficulty = "参考"
prereq = ["在文档里遇到不认识的 Hugo 术语时查阅"]
outcomes = ["能判断一个资源是什么类型，并说清自定义输出格式时媒体类型写错会怎样"]
next = ["/configuration/media-types/"]
+++

媒体类型（media type，旧称 MIME 类型）是表示文件格式与传输内容的两段式标识符。例如 HTML 内容的媒体类型是 `text/html`。

参见：[媒体类型配置](/configuration/media-types/)

## 为什么重要

Hugo 用媒体类型（`text/html`、`image/webp` 这样的两段式标识符）识别文件格式，[output format](g)（输出格式）、资源类型与图片处理都建立在它之上。自定义输出格式时把 `mediaType` 写错，生成的文件会被下游按错误类型处理；做资源判断时如果拿不到预期的 `image`，也先回头核对媒体类型。这类错误不会中断构建，只会让结果悄悄不对。

延伸阅读：[媒体类型配置](/configuration/media-types/)、[输出格式配置](/configuration/output-formats/)
