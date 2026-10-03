+++
title = "永久链接（permalink）"
linkTitle = "永久链接"
description = "已发布资源或已渲染页面的绝对 URL，包含协议与主机。"
date = 2026-10-02
weight = 990
source = "https://gohugo.io/quick-reference/glossary/permalink/"

[params.teach]
difficulty = "参考"
prereq = ["在文档里遇到不认识的 Hugo 术语时查阅"]
outcomes = ["分清 permalink 与 relpermalink 各自该用在哪里，并知道对外地址出错时先检查 `baseURL`"]
next = ["/configuration/permalinks/"]
+++

永久链接（permalink）是已发布资源或已渲染页面的绝对 URL，包含协议和主机。

## 为什么重要

RSS、sitemap、canonical 链接和 `og:url` 这类交给外部系统读取的地方必须用绝对 URL，也就都会用 permalink，因此 `baseURL` 写错会一次性污染所有对外地址——本地预览时它还会是 `http://localhost:1313`。
站内页面互链则应该用相对地址（`.RelPermalink`），否则换域名或部署到子路径时又要全站改一遍；两者混用是「本地正常、上线后链接全错」的常见来源。

延伸阅读：[Permalink 方法](/methods/page/permalink/) · [永久链接配置](/configuration/permalinks/)
