+++
title = "主输出格式（primary output format）"
linkTitle = "主输出格式"
description = "某种页面类型在输出配置中的第一项。"
date = 2026-10-02
weight = 1030
source = "https://gohugo.io/quick-reference/glossary/primary-output-format/"

[params.teach]
difficulty = "参考"
prereq = ["在文档里遇到不认识的 Hugo 术语时查阅"]
outcomes = ["知道 `.Permalink` 指向哪个产物由谁决定，并预判调整 `outputs` 顺序的后果"]
next = ["/configuration/outputs/"]
+++

给定 [page kind](g) 的主输出格式（primary output format）是[输出配置](/configuration/outputs/)中的第一项。

参见：[输出配置](/configuration/outputs/)

## 为什么重要

`.Permalink`、`.RelPermalink` 默认跟着主输出格式走，因此 `outputs` 列表的顺序不是随便排的：把 `html` 挪出首位，页面上的链接、sitemap 和 RSS 里的地址就可能指向 JSON、RSS 之类的非 HTML 产物。
需要「首页同时有 HTML 和 JSON」时，正确做法是在列表首位保留 `html`、把其它格式追加在后面；改完顺序后务必在构建产物里核对链接实际指向哪个文件。

延伸阅读：[输出配置](/configuration/outputs/) · [输出格式配置](/configuration/output-formats/)
