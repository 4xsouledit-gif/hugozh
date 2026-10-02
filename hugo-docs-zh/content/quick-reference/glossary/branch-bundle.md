+++
title = "分支包"
linkTitle = "分支包"
description = "含 _index.md 的内容目录，可以有后代。"
date = 2026-10-02
weight = 90
source = "https://gohugo.io/quick-reference/glossary/branch-bundle/"

[params.teach]
difficulty = "参考"
prereq = ["在文档里遇到不认识的 Hugo 术语时查阅"]
outcomes = ["判断一个目录会不会生成列表页，并知道该给它补什么文件"]
next = ["/content-management/page-bundles/"]
+++

## 分支包

_分支包_（branch bundle）是顶层内容目录，或任何包含&nbsp;`_index.md`&nbsp;文件的内容目录。类似现实中的树枝，分支包可以有后代，包括 [leaf bundle](g)（叶子包）与其他分支包。分支包还可以包含 [page resource](g)（页面资源），例如图片。

参见：[页面包](/content-management/page-bundles/)

## 为什么重要

一个目录有没有 `_index.md`，决定它是不是可渲染的列表页：有，它就是一个 section（内容区块），能用 `.Pages`、`.Sections` 遍历后代；没有，目录本身不生成页面，里面的 `.md` 各自独立成页。给章节补内容时漏掉 `_index.md`，常见现象是该 section 的列表页 404，或导航里少了这一层。

延伸阅读：[内容区块](/content-management/sections/) · [页面资源](/content-management/page-resources/)
