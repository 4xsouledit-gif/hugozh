+++
title = "角色（role）"
linkTitle = "角色"
description = "一种维度，使逻辑页面可以按目标受众以不同形式提供。"
date = 2026-10-02
weight = 1160
source = "https://gohugo.io/quick-reference/glossary/role/"

[params.teach]
difficulty = "参考"
prereq = ["在文档里遇到不认识的 Hugo 术语时查阅"]
outcomes = ["能判断当前项目是否用到了角色维度，以及一份内容该出现在哪些角色站点上"]
next = ["/configuration/roles/"]
+++

角色（role）是一种 [dimension](g)，允许同一个逻辑页面根据目标受众以不同形式提供。[language](g) 侧重于本地化，[version](g) 侧重于生命周期，而角色维度允许项目在不重复内容的情况下生成页面的变体。

另见：[default role](g)。

## 为什么重要

角色是内容维度之一：在站点配置里声明 `roles` 之后，同一份内容可以为不同受众生成不同站点（例如 `/guest/`、`/admin/`），不必复制页面。它只在多角色项目里才需要关心；配置了角色却忘了为内容声明对应的站点矩阵，相关内容就不会出现在那些角色站点上。

延伸阅读：[角色配置](/configuration/roles/)、[多语言](/content-management/multilingual/)
