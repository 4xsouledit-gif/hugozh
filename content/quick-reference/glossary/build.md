+++
title = "构建"
linkTitle = "构建"
description = "为项目生成静态文件的过程。"
date = 2026-10-02
weight = 120
source = "https://gohugo.io/quick-reference/glossary/build/"

[params.teach]
difficulty = "参考"
prereq = ["在文档里遇到不认识的 Hugo 术语时查阅"]
outcomes = ["看懂构建日志里报的是内容问题还是环境问题，并分清本地预览与正式构建"]
next = ["/commands/hugo-build/"]
+++

## 构建

_构建_（build，动词）是为 [project](g)（项目）生成静态文件的过程，生成的内容包括 HTML、图片、CSS 与 JavaScript。这一过程会渲染模板、转换资源，并解析项目配置中定义的 [language](g)（语言）、[role](g)（角色）与 [version](g)（版本）矩阵。

## 为什么重要

构建是「一次把整个站点算出来」：内容、模板、配置任何一处出错都会中断，并在报错里给出文件与行号，所以构建失败通常先查内容而不是服务器。`hugo server` 的构建发生在内存里、改动即刷新；只有 `hugo` 才会把产物写进发布目录，两者现象不同，别拿本地预览当作部署验证。

延伸阅读：[hugo build 命令](/commands/hugo-build/) · [快速上手](/getting-started/quick-start/)
