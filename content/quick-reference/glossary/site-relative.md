+++
title = "站点相对路径（site-relative）"
linkTitle = "站点相对路径"
description = "相对于内容目录根解析的路径，以斜杠开头。"
date = 2026-10-02
weight = 1270
source = "https://gohugo.io/quick-reference/glossary/site-relative/"

[params.teach]
difficulty = "参考"
prereq = ["在文档里遇到不认识的 Hugo 术语时查阅"]
outcomes = ["能判断一条手写的站内路径在子目录或多语言部署下是否仍然正确"]
next = ["/content-management/urls/"]
+++

_站点相对路径_（site-relative）是相对于内容目录根解析的路径。这类路径以斜杠开头。例如，`/old-name` 就是一条站点相对路径。

另请参见：[_page-relative_](g)、[_server-relative_](g)。

## 为什么重要

站点相对路径以内容目录根为基准书写（如 `/old-name`），适合在正文和配置里手写站内链接，但它不理解语言前缀与部署子目录。多语言站点或部署在 `/docs/` 这类子目录时，`/old-name` 可能指向错误的位置；这时应改用 `relURL`、`relLangURL`，或者直接写 `.RelPermalink`。

延伸阅读：[URL 管理](/content-management/urls/)
