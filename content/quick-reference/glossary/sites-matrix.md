+++
title = "站点矩阵（sites matrix）"
linkTitle = "站点矩阵"
description = "控制内容为哪些站点生成的配置对象，是语言、角色与版本三个维度的交集。"
date = 2026-10-02
weight = 1310
source = "https://gohugo.io/quick-reference/glossary/sites-matrix/"

[params.teach]
difficulty = "参考"
prereq = ["在文档里遇到不认识的 Hugo 术语时查阅"]
outcomes = ["能判断一份内容或一个模板该出现在哪些站点，并知道矩阵写错时的典型症状"]
next = ["/content-management/front-matter/"]
+++

_站点矩阵_（sites matrix）是在内容前置元数据或文件挂载中定义的配置对象，用于精确控制内容应为哪些 [_sites_](g) 生成。在文件挂载中为模板定义时，它控制该模板将应用于哪些站点。在 Hugo 的多维内容模型中，该矩阵定义了三个维度的交集：[_language_](g)、[_role_](g) 和 [_version_](g)。该配置的结构是一个由 [_glob slices_](g) 组成的映射。

另请参见 [_sites complements_](g)、[front matter: sites][]、[module mounts: sites][] 和 [segments: sites][]。

## 为什么重要

启用语言、角色或版本之后会产生站点矩阵；不加以约束，同一篇文章就会出现在所有站点上。`sites.matrix` 是「这份内容只发到哪几个站点」的开关，可以写在内容前置元数据里，也可以写在文件挂载里（此时控制模板应用到哪些站点）。glob 写错或漏掉排除项，最典型的现象是内部文档出现在不该出现的站点上。

延伸阅读：[前置元数据 sites 字段](/content-management/front-matter/#级联)、[模块挂载 sites](/configuration/module/#默认挂载)

[front matter: sites]: /content-management/front-matter/#级联
[module mounts: sites]: /configuration/module/#默认挂载
[segments: sites]: /configuration/segments/#sites
