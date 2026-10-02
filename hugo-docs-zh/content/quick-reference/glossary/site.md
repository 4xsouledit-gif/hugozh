+++
title = "站点（site）"
linkTitle = "站点"
description = "项目的一个具体实例，代表语言、角色与版本的唯一组合。"
date = 2026-10-02
weight = 1290
source = "https://gohugo.io/quick-reference/glossary/site/"

[params.teach]
difficulty = "参考"
prereq = ["在文档里遇到不认识的 Hugo 术语时查阅"]
outcomes = ["能说出当前模板里的 `.Site` 指哪一个站点，并在多语言项目里取到正确语言的数据"]
next = ["/content-management/multilingual/"]
+++

_站点_（site）是 [_project_](g) 的一个具体实例，代表 [_language_](g)、[_role_](g) 和 [_version_](g) 的唯一组合。虽然简单的项目可能只包含单个站点，但 Hugo 的多维内容模型允许同一份代码库同时生成站点矩阵。

## 为什么重要

单语言单角色项目的「站点」就是整站；一旦启用语言、角色或版本，同一份 `content/` 会为每个组合各生成一个站点，模板里的 `.Site` 只指当前这一个。把 `.Site` 当作全局来用，多语言站点上会拿到错误语言的数据——需要跨站点数据时用 `.Sites`，判断当前语言用 `.Site.Language`。

延伸阅读：[多语言](/content-management/multilingual/)、[配置总览](/configuration/all/)
