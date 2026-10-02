+++
title = "相对永久链接（relative permalink）"
linkTitle = "相对永久链接"
description = "已发布资源或已渲染页面的主机相对 URL。"
date = 2026-10-02
weight = 1100
source = "https://gohugo.io/quick-reference/glossary/relative-permalink/"

[params.teach]
difficulty = "参考"
prereq = ["在文档里遇到不认识的 Hugo 术语时查阅"]
outcomes = ["能判断一处链接或资源引用该用 `.RelPermalink` 还是写死的绝对地址，并知道换域名时各自会怎样"]
next = ["/content-management/urls/"]
+++

相对永久链接（relative permalink）是已发布资源或已渲染页面的主机相对 URL。

## 为什么重要

站内链接与资源引用应当写 `.RelPermalink`（也就是相对永久链接），这样改动 `baseURL`、把站点部署到子目录或更换域名时，链接会自动跟着变。若在模板里写死 `https://example.com/...`，本地预览往往正常，上线到子目录后整站链接却跳回错误域名——这是最典型的现象。

延伸阅读：[URL 管理](/content-management/urls/)、[永久链接配置](/configuration/permalinks/)
