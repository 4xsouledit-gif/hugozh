+++
title = "内容视图"
linkTitle = "内容视图"
description = "「内容视图」即视图模板（view template）。"
date = 2026-10-02
weight = 280
source = "https://gohugo.io/quick-reference/glossary/content-view/"

[params.teach]
difficulty = "参考"
prereq = ["在文档里遇到不认识的 Hugo 术语时查阅"]
outcomes = ["判断列表页显示不出条目或每条都渲染成完整正文时，该去检查哪个模板"]
next = ["/templates/types/"]
+++

## 内容视图

参见 [view template](g)（视图模板）。

## 为什么重要

内容视图指把「一组页面」渲染成卡片、摘要列表的那类模板，常见于 section 首页与分类页，通过页面的 `Render` 方法按查找顺序选中。列表页显示不出条目、或每条都渲染成完整正文，多是视图模板没遍历页面集合、或文件名与查找规则不符，而不是内容本身有问题。同一批内容要在不同页面以不同版式出现时，用视图模板比复制局部模板更省事。

延伸阅读：[模板类型](/templates/types/) · [内容区块](/content-management/sections/)
