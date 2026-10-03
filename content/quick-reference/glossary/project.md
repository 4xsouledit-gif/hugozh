+++
title = "项目（project）"
linkTitle = "项目"
description = "用于生成一个或多个站点的组件集合。"
date = 2026-10-02
weight = 1050
source = "https://gohugo.io/quick-reference/glossary/project/"

[params.teach]
difficulty = "参考"
prereq = ["在文档里遇到不认识的 Hugo 术语时查阅"]
outcomes = ["找到项目根目录下决定构建的文件与目录，并理解为什么同一套内容能生成多个站点"]
next = ["/getting-started/directory-structure/"]
+++

项目（project）是用于生成一个或多个 [sites](g) 的 [components](g) 集合。虽然一个项目可能只包含单个站点，但 Hugo 允许单个项目基于 [language](g)、[role](g) 和 [version](g) 生成站点矩阵。项目是构建中所有站点共用的资源与逻辑的父容器。

## 为什么重要

命令行的 `hugo` 总是以项目根为基准：`hugo.toml`、`content/`、`layouts/`、`assets/`、`static/` 都相对它定位，`hugo config` 输出的也是这一层的生效配置——模板没生效时，先确认文件确实在项目里，而不是只存在于主题目录中。
一个项目可以产出多个站点（多语言、多版本、多角色），模板里 `site` 与 `Sites` 的区别、资源路径为何按项目定位，答案都在这里；也正因如此，改一处项目级配置会影响该项目下的所有站点。

延伸阅读：[目录结构](/getting-started/directory-structure/) · [版本配置](/configuration/versions/)
