+++
title = "包"
linkTitle = "包"
description = "页面包（page bundle）的简称。"
date = 2026-10-02
weight = 130
source = "https://gohugo.io/quick-reference/glossary/bundle/"

[params.teach]
difficulty = "参考"
prereq = ["在文档里遇到不认识的 Hugo 术语时查阅"]
outcomes = ["判断页面资源为什么取不到，以及该把文件放到哪里"]
next = ["/content-management/page-bundles/"]
+++

## 包

参见 [page bundle](g)（页面包）。

## 为什么重要

说「包」通常指页面与它的资源放在同一目录：目录名决定 URL，`index.md` 把页面和图片、附件绑定在一起，页面上的 `.Resources` 才能取到它们。资源放在 `static/` 或写成绝对路径引用时，图照样能显示，但 `.Resources` 是空的，响应式图片与 `resources.Get` 都会失败——典型现象就是「图能看见，代码却取不到」。

延伸阅读：[页面包](/content-management/page-bundles/) · [页面资源](/content-management/page-resources/)
