+++
title = "站点互补（sites complements）"
linkTitle = "站点互补"
description = "在内容前置元数据或文件挂载中定义的配置对象，其链接指向互补站点。"
date = 2026-10-02
weight = 1300
source = "https://gohugo.io/quick-reference/glossary/sites-complements/"

[params.teach]
difficulty = "参考"
prereq = ["在文档里遇到不认识的 Hugo 术语时查阅"]
outcomes = ["能判断一份内容该用 sites matrix 还是 sites complements，并在互补链接为空时定位 glob 写法"]
next = ["/configuration/versions/"]
+++

_站点互补_（sites complements）是在内容前置元数据或文件挂载中定义的配置对象。其链接将指向互补的 [_sites_](g)。该配置的结构是一个由 [_glob slices_](g) 组成的映射。

## 为什么重要

站点互补用于多版本（或多语言）项目：通过 `sites.complements` 声明「本页是另一些站点里对应页面的补充内容」，Hugo 据此把互补链接指向那些站点，从而不必复制页面。它只在启用内容维度之后才有意义；glob 写法（版本号模式、`**`）写错不会报错，只是互补链接为空，属于「没报错但结果不对」的一类问题。

延伸阅读：[版本配置](/configuration/versions/)、[前置元数据 sites 字段](/content-management/front-matter/#级联)
