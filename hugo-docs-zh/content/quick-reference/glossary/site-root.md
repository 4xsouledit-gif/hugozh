+++
title = "站点根目录（site root）"
linkTitle = "站点根目录"
description = "当前站点相对于 publishDir 的根目录，可包含一个或多个内容维度前缀。"
date = 2026-10-02
weight = 1280
source = "https://gohugo.io/quick-reference/glossary/site-root/"
+++

_站点根目录_（site root）是当前 [_site_](g) 的根目录，相对于 [`publishDir`][]。_站点根目录_可以包含一个或多个内容 [_dimension_](g) 前缀，例如 [_language_](g)、[_role_](g) 或 [_version_](g)。

项目说明|站点根目录示例
:--|:--|:--
单语言|`/`、`/guest`、`/guest/v1.2.3`
多语言单主机|`/en`、`/guest/en`、`/guest/v1.2.3/en`
多语言多主机|`/en`、`/en/guest`、`/en/guest/v1.2.3`

[`publishDir`]: /configuration/all/#publishdir
