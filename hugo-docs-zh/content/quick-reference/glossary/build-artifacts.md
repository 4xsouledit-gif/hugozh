+++
title = "构建产物"
linkTitle = "构建产物"
description = "构建过程中生成的静态文件，默认存放于 public 目录。"
date = 2026-10-02
weight = 110
source = "https://gohugo.io/quick-reference/glossary/build-artifacts/"

[params.teach]
difficulty = "参考"
prereq = ["在文档里遇到不认识的 Hugo 术语时查阅"]
outcomes = ["说清部署时该上传什么、不该提交什么，并能到产物里核对路径"]
next = ["/commands/hugo-build/"]
+++

## 构建产物

_构建产物_（build artifacts）是在 [build](g)（构建）过程中生成的静态文件。这些资源默认存放在 `public` 目录中，代表项目最终可以直接部署的输出。

## 为什么重要

要部署的是构建产物，不是项目源码：把 `public/` 提交进 Git，或把源码目录直接交给托管平台，都会失败或发布出错误内容。产物里没有模板和 Markdown，只有最终的 HTML、CSS、JavaScript 与资源，所以模板改动必须重新构建才会体现。核对时看 `public/` 下的文件名与路径是否符合你配置的发布目录与永久链接规则。

延伸阅读：[hugo build 命令](/commands/hugo-build/) · [构建配置](/configuration/build/)
