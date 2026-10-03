+++
title = "输出格式（output format）"
linkTitle = "输出格式"
description = "定义 Hugo 构建站点时如何渲染文件的一组设置。"
date = 2026-10-02
weight = 840
source = "https://gohugo.io/quick-reference/glossary/output-format/"

[params.teach]
difficulty = "参考"
prereq = ["在文档里遇到不认识的 Hugo 术语时查阅"]
outcomes = ["判断一个页面为什么只生成了 HTML，以及要额外产出 RSS、JSON 等文件时该改哪两处配置"]
next = ["/configuration/output-formats/"]
+++

输出格式（output format）是一组设置，定义 Hugo 构建站点时如何渲染文件。例如，`html`、`json` 和 `rss` 都是内置输出格式。你可以创建多种输出格式，并依据 [page kind](g) 控制其生成，或为特定页面启用一种或多种输出格式。

参见：[输出格式配置](/configuration/output-formats/)

## 为什么重要

给站点加 RSS、JSON 索引或纯文本输出要动两个地方：先在 `outputFormats` 里定义格式，再在 `outputs` 里按页面类型启用；只做前一步，构建不会报错，只是目标文件根本不存在。
反过来说，每启用一种输出格式，每页就多一份产物。顺序还有额外含义：`outputs` 里的第一项是该页面类型的主输出格式，它决定 `.Permalink` 指向哪个文件——把 `html` 挪出首位，站内链接、sitemap 与 RSS 里的地址都会跟着变。

延伸阅读：[输出格式配置](/configuration/output-formats/) · [输出配置](/configuration/outputs/)
