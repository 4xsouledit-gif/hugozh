+++
title = "短代码（shortcode）"
linkTitle = "短代码"
description = "在标记中调用的模板，可接受任意数量的参数，用于插入视频、图片等元素。"
date = 2026-10-02
weight = 1260
source = "https://gohugo.io/quick-reference/glossary/shortcode/"

[params.teach]
difficulty = "参考"
prereq = ["在文档里遇到不认识的 Hugo 术语时查阅"]
outcomes = ["能判断一段内容该用短代码还是直接写 Markdown，并知道构建因短代码失败时先检查什么"]
next = ["/shortcodes/"]
+++

_短代码_（shortcode）是在标记中调用的 [_template_](g)，可接受任意数量的 [_arguments_](g)。它们可与任何 [_content format_](g) 一起使用，把视频、图片和社交媒体嵌入等元素插入内容。

参见：[短代码](/content-management/shortcodes/)

## 为什么重要

短代码是让正文作者在不写 HTML 的前提下插入视频、图片、代码块等元素的出口，改一处模板就能改全站的输出。调用本站不存在的短代码会让**整个站点**构建失败，报 `template for shortcode ... not found`；想在正文里展示短代码语法本身也必须转义，否则会触发同样的失败。

延伸阅读：[短代码目录](/shortcodes/)、[短代码模板](/templates/shortcode/)
