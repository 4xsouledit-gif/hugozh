+++
title = "丑陋 URL（ugly URL）"
linkTitle = "丑陋 URL"
description = "包含文件扩展名的 URL。"
date = 2026-10-02
weight = 1460
source = "https://gohugo.io/quick-reference/glossary/ugly-url/"

[params.teach]
difficulty = "参考"
prereq = ["在文档里遇到不认识的 Hugo 术语时查阅"]
outcomes = [
  "判断站点 URL 的形态由哪个开关决定，以及切换后要同步改哪些链接",
]
next = ["/configuration/ugly-urls/"]
+++

_丑陋 URL_（ugly URL）是包含文件扩展名的 URL。

## 为什么重要

站点要么全用 `/about/` 这类目录式地址，要么全用 `/about.html` 这类带扩展名的地址，切换开关会改变**所有**页面的地址形态与站内链接。典型事故是本地预览正常、部署后大量 404：要么本地与线上用了不同的 URL 设置，要么菜单、永久链接之类的手写链接还停在旧形态。切换前后都要把站内链接与外部反向链接一起核对。

延伸阅读：[丑陋 URL 配置](/configuration/ugly-urls/)、[URL 管理](/content-management/urls/)
