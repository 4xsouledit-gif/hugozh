+++
title = "内容适配器"
linkTitle = "内容适配器"
description = "在构建站点时动态创建页面的模板。"
date = 2026-10-02
weight = 240
source = "https://gohugo.io/quick-reference/glossary/content-adapter/"

[params.teach]
difficulty = "参考"
prereq = ["在文档里遇到不认识的 Hugo 术语时查阅"]
outcomes = ["判断某个页面是不是内容适配器生成的，并知道该去 content 目录里找哪个文件"]
next = ["/content-management/content-adapters/"]
+++

## 内容适配器

_内容适配器_（content adapter）是一种在构建站点时动态创建页面的 [template](g)（模板）。例如，可以用它从 JSON、TOML、YAML 或 XML 等远程数据源创建页面。

参见：[内容适配器](/content-management/content-adapters/)

## 为什么重要

内容适配器让「没有对应 `.md` 文件」的页面也能出现在站点里：构建时按数据源生成，页面数量随数据变化。它必须放在 `content` 目录中（文件名 `_content.gotmpl`），每个目录、每种语言最多一个，生成页面的逻辑路径相对适配器所在目录。用 `hugo list all` 看到某一行的 `path` 列指向 `_content.gotmpl`，就说明那是适配器生成的页面。

延伸阅读：[数据源](/content-management/data-sources/) · [transform.Unmarshal](/functions/transform/unmarshal/)
