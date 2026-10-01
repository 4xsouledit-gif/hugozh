+++
title = "站点矩阵（sites matrix）"
linkTitle = "站点矩阵"
description = "控制内容为哪些站点生成的配置对象，是语言、角色与版本三个维度的交集。"
date = 2026-10-02
weight = 1310
source = "https://gohugo.io/quick-reference/glossary/sites-matrix/"
+++

_站点矩阵_（sites matrix）是在内容前置元数据或文件挂载中定义的配置对象，用于精确控制内容应为哪些 [_sites_](g) 生成。在文件挂载中为模板定义时，它控制该模板将应用于哪些站点。在 Hugo 的多维内容模型中，该矩阵定义了三个维度的交集：[_language_](g)、[_role_](g) 和 [_version_](g)。该配置的结构是一个由 [_glob slices_](g) 组成的映射。

另请参见 [_sites complements_](g)、[front matter: sites][]、[module mounts: sites][] 和 [segments: sites][]。

[front matter: sites]: /content-management/front-matter/#sites
[module mounts: sites]: /configuration/module/#sites
[segments: sites]: /configuration/segments/#sites
