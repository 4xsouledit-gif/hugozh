+++
title = "Glob 模式"
linkTitle = "Glob 模式"
description = "用于匹配一组值的模式，可一次指定多个目标。"
date = 2026-10-02
weight = 480
source = "https://gohugo.io/quick-reference/glossary/glob-pattern/"

[params.teach]
difficulty = "参考"
prereq = ["在文档里遇到不认识的 Hugo 术语时查阅"]
outcomes = ["能读懂 `*` 与 `**` 的匹配范围，并解释资源查找为什么返回空"]
next = ["/quick-reference/glob-patterns/"]
+++

Glob 模式（glob pattern）是一种用于匹配多组值的模式。它是一次性指定多个目标的简写形式，便于处理成组的数据或配置。

## 为什么重要

资源查找函数（如 `resources.GetMatch`）、模块挂载和分类过滤都用 Glob 模式选文件，匹配失败时函数的返回是空值而不是错误，所以症状通常是「样式/图片没出现」而不是构建失败。最容易踩的是通配符范围：`*` 不跨目录分隔符、`**` 才跨目录，`assets/css/*.css` 找不到子目录里的文件，写 `assets/**` 又可能把不该包含的文件一起选进来；路径是相对项目根（或所挂载目录）书写的，多一层或少一层前缀同样会静默匹配为空。

延伸阅读：[Glob 模式](/quick-reference/glob-patterns/)、[使用模块](/hugo-modules/use-modules/)

参见：[Glob 模式](/quick-reference/glob-patterns/)
