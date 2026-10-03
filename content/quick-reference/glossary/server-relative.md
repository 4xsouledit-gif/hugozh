+++
title = "服务器相对路径（server-relative）"
linkTitle = "服务器相对路径"
description = "生成站点中从 Web 服务器根目录算起的最终路径，含 baseURL 与内容维度前缀。"
date = 2026-10-02
weight = 1250
source = "https://gohugo.io/quick-reference/glossary/server-relative/"

[params.teach]
difficulty = "参考"
prereq = ["在文档里遇到不认识的 Hugo 术语时查阅"]
outcomes = ["能分清服务器相对路径与站点相对路径，并在多语言或子目录部署下选对写法"]
next = ["/content-management/urls/"]
+++

_服务器相对路径_（server-relative）是生成站点中使用的、从 Web 服务器根目录算起的最终路径。这类路径总是以斜杠开头，并且计入了 [`baseURL`][] 以及语言、[_role_](g) 或版本等 [_content dimension_](g) 前缀。例如，`/en/examples/old-name/` 就是一条服务器相对路径。

另请参见：[_page-relative_](g)、[_site-relative_](g)。

## 为什么重要

服务器相对路径是「部署后浏览器实际请求的最终路径」，已经计入 `baseURL` 与语言、角色、版本前缀。调试「本地正常、上线 404」时先分清手的路径属于哪一种：多语言或部署在子目录时，手写的 `/about/`（站点相对路径）会漏掉 `/en/` 之类前缀，而 `.RelPermalink` 生成的正是正确的服务器相对路径。

延伸阅读：[URL 管理](/content-management/urls/)、[永久链接配置](/configuration/permalinks/)

[`baseURL`]: /configuration/all/#baseurl
