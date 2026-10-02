+++
title = "站点根目录（site root）"
linkTitle = "站点根目录"
description = "当前站点相对于 publishDir 的根目录，可包含一个或多个内容维度前缀。"
date = 2026-10-02
weight = 1280
source = "https://gohugo.io/quick-reference/glossary/site-root/"

[params.teach]
difficulty = "参考"
prereq = ["在文档里遇到不认识的 Hugo 术语时查阅"]
outcomes = ["能判断当前站点的根目录层级，并预判发布产物会落在哪个子目录"]
next = ["/getting-started/directory-structure/"]
+++

_站点根目录_（site root）是当前 [_site_](g) 的根目录，相对于 [`publishDir`][]。_站点根目录_可以包含一个或多个内容 [_dimension_](g) 前缀，例如 [_language_](g)、[_role_](g) 或 [_version_](g)。

项目说明|站点根目录示例
:--|:--|:--
单语言|`/`、`/guest`、`/guest/v1.2.3`
多语言单主机|`/en`、`/guest/en`、`/guest/v1.2.3/en`
多语言多主机|`/en`、`/en/guest`、`/en/guest/v1.2.3`

## 为什么重要

站点根目录决定发布产物里的路径层级：单语言项目通常是 `/`，多语言单主机项目则是 `/en`、`/zh`。它直接影响「构建结果落在哪个子目录」以及相关路径怎么写；不清楚它，把站点部署到二级目录时就容易到处写错链接。

延伸阅读：[目录结构](/getting-started/directory-structure/)、[配置总览](/configuration/all/)

[`publishDir`]: /configuration/all/#publishdir
