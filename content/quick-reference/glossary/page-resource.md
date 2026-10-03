+++
title = "页面资源（page resource）"
linkTitle = "页面资源"
description = "页面包中的文件。"
date = 2026-10-02
weight = 900
source = "https://gohugo.io/quick-reference/glossary/page-resource/"

[params.teach]
difficulty = "参考"
prereq = ["在文档里遇到不认识的 Hugo 术语时查阅"]
outcomes = ["判断一个文件会不会成为页面资源，并在 `.Resources` 为空时知道该去核对哪几处"]
next = ["/content-management/page-resources/"]
+++

页面资源（page resource）是 [page bundle](g) 中的文件。

## 为什么重要

`.Resources`、`Resources.GetMatch`、`resources.Get` 适用于不同位置的文件，选错时的表现都是「取不到」：集合为空，或匹配函数返回 nil，而构建不报错。
按页面归档的图片、附件要放进页面包目录；若同一份文件改放在 `assets/` 或 `static/`，它就成了 [global resource](g)，只能用全局资源的取法，两类资源的路径基准并不相同。
拿不到资源时，先确认文件确实在包的目录里、扩展名大小写一致，再去改模板。

延伸阅读：[页面资源](/content-management/page-resources/) · [Resources 方法](/methods/page/resources/)
