+++
title = "页面包（page bundle）"
linkTitle = "页面包"
description = "同时封装内容及其关联资源的目录。"
date = 2026-10-02
weight = 850
source = "https://gohugo.io/quick-reference/glossary/page-bundle/"

[params.teach]
difficulty = "参考"
prereq = ["在文档里遇到不认识的 Hugo 术语时查阅"]
outcomes = ["判断一张图片或附件该放进页面包、`assets/` 还是 `static/`，并知道模板里相应该用哪种取法"]
next = ["/content-management/page-bundles/"]
+++

页面包（page bundle）是同时封装内容及其关联 [resources](g) 的目录。页面包分为两种类型：[leaf bundles](g) 和 [branch bundles](g)。

参见：[页面包](/content-management/page-bundles/)

## 为什么重要

把内容页和它引用的图片、附件放进同一个目录，用 `index.md` 组织，页面就能通过 `.Resources`、`Resources.GetMatch` 取到「这一页自己的资源」，相对的图片引用也才能按预期解析。
换成 `_index.md`，同一个文件就属于分支包资源；如果把文件直接放进 `assets/` 或 `static/`，它就是全局资源，模板里要改用 `resources.Get` 之类按路径查找——三种摆法都能构建成功，取值方式却完全不同。
混用时的典型现象是 `.Resources` 为空、`GetMatch` 返回 nil，而构建过程一声不响。

延伸阅读：[页面包](/content-management/page-bundles/) · [页面资源](/content-management/page-resources/)
