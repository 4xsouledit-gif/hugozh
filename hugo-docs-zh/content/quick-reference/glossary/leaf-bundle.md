+++
title = "叶子包（leaf bundle）"
linkTitle = "叶子包"
description = "包含 `index.md` 文件及零个或多个资源的目录，没有下级。"
date = 2026-10-02
weight = 670
source = "https://gohugo.io/quick-reference/glossary/leaf-bundle/"

[params.teach]
difficulty = "参考"
prereq = ["在文档里遇到不认识的 Hugo 术语时查阅"]
outcomes = ["能只看目录里的文件名就判断是不是叶子包，并说清图片为什么取不到"]
next = ["/content-management/page-bundles/"]
+++

叶子包（leaf bundle）是包含一个&nbsp;`index.md`&nbsp;文件以及零个或多个[resources](g)的目录。类比真实的叶子，叶子包位于[branch bundle](g)的末端，没有下级。

参见：[页面包](/content-management/page-bundles/)

## 为什么重要

判断一个目录是不是叶子包，只看里面放的是 `index.md` 还是 `_index.md`：前者是叶子包，后者是分支包。写成 `_index.md` 后，该目录会被当作 section，同级图片不再作为 [page resource](g) 绑定到页面上，`Resources` 取不到东西，URL 也变成目录形式。页面包内除 `index.md` 外的文件都随页面发布，这决定了图片该放在哪里。

延伸阅读：[页面包](/content-management/page-bundles/)、[页面资源](/content-management/page-resources/)
