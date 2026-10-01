+++
title = "服务器相对路径（server-relative）"
linkTitle = "服务器相对路径"
description = "生成站点中从 Web 服务器根目录算起的最终路径，含 baseURL 与内容维度前缀。"
date = 2026-10-02
weight = 1250
source = "https://gohugo.io/quick-reference/glossary/server-relative/"
+++

_服务器相对路径_（server-relative）是生成站点中使用的、从 Web 服务器根目录算起的最终路径。这类路径总是以斜杠开头，并且计入了 [`baseURL`][] 以及语言、[_role_](g) 或版本等 [_content dimension_](g) 前缀。例如，`/en/examples/old-name/` 就是一条服务器相对路径。

另请参见：[_page-relative_](g)、[_site-relative_](g)。

[`baseURL`]: /configuration/all/#baseurl
