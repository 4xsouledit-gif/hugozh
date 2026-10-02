+++
title = "工作区（workspace）"
linkTitle = "工作区"
description = "磁盘上一组模块的集合。"
date = 2026-10-02
weight = 1570
source = "https://gohugo.io/quick-reference/glossary/workspace/"

[params.teach]
difficulty = "参考"
prereq = ["在文档里遇到不认识的 Hugo 术语时查阅"]
outcomes = [
  "判断构建用的是本地模块还是模块缓存，并知道怎么让本地改动的热重载生效",
]
next = ["/hugo-modules/use-modules/"]
+++

_工作区_（workspace）是磁盘上的一组 [_modules_](g)。

参见：[使用模块](/hugo-modules/use-modules/#本地开发)

## 为什么重要

工作区把多个本地模块（最典型的是你正在改的主题）接到一起开发：用 `.work` 文件列出模块路径，再通过配置项 `workspace` 或环境变量 `HUGO_MODULE_WORKSPACE` 启用，构建就直接用本地目录而不是模块缓存里的版本。它的坑全在「这次构建到底用了哪一份」：没启用工作区，改了本地主题站点也不变；启用了却还开着 vendor，本地改动依旧不热重载，需要按文档加 `--ignoreVendorPaths "**"`。排查时先确认工作区是否生效，再看模块配置里的 replace。

延伸阅读：[使用模块](/hugo-modules/use-modules/)、[模块简介](/hugo-modules/introduction/)
