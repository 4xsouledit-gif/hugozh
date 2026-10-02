+++
title = "版本（version）"
linkTitle = "版本"
description = "表示内容某个特定迭代、发布或生命周期阶段的维度。"
date = 2026-10-02
weight = 1520
source = "https://gohugo.io/quick-reference/glossary/version/"

[params.teach]
difficulty = "参考"
prereq = ["在文档里遇到不认识的 Hugo 术语时查阅"]
outcomes = [
  "判断版本相关的配置写错会出现什么现象，以及哪些名字必须逐字核对",
]
next = ["/configuration/versions/"]
+++

_版本_（version）是一种 [_dimension_](g)，表示内容的某个特定迭代、发布或生命周期阶段。[_language_](g) 关注本地化，[_role_](g) 关注受众，而版本维度让你可以使用[语义化版本][semantic versioning]同时维护同一内容的多份状态。

另请参见：[_default version_](g)。

## 为什么重要

版本维度让同一份内容的多份状态在一次构建里共存（例如 v1 与 v2 文档），模板再按版本把读者导向对应内容。它和语言、角色不是一回事，配错的表现也很直接：版本名不写成语义化版本号会失去排序依据；`defaultContentVersion` 与已定义版本名不一致时行为不在文档保证范围内；默认版本是否进入同名子目录（`defaultContentVersionInSubdir`）没定好，则会出现同一页在错误版本下可见、或版本切换器指向空页面。改完版本配置，要连站内链接一起核对。

延伸阅读：[版本配置](/configuration/versions/)、[内容组织](/content-management/organization/)

[semantic versioning]: https://semver.org/
