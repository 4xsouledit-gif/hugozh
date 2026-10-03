+++
title = "分页（pagination）"
linkTitle = "分页"
description = "对列表页执行分页的过程。"
date = 2026-10-02
weight = 930
source = "https://gohugo.io/quick-reference/glossary/pagination/"

[params.teach]
difficulty = "参考"
prereq = ["在文档里遇到不认识的 Hugo 术语时查阅"]
outcomes = ["判断分页没生效是数据没切还是导航没画，并知道去哪改每页条数与分页地址"]
next = ["/templates/pagination/"]
+++

术语分页（pagination）指对一个列表页进行 [paginating](g) 的过程。

参见：[分页](/templates/pagination/)

## 为什么重要

分页只在列表型页面上有意义：`home`、`section`、[taxonomy](g) 与 [term](g) 页；在常规内容页上调用会直接构建失败，报 `pagination not supported for this page`。
它同时牵动模板与配置两端：模板负责切数据、画导航，`[pagination]` 配置负责每页条数与分页地址的片段（默认形如 `/page/2/`），只改一端就会出现「页码变了但内容没变」或「第一页正常、第二页 404」。

延伸阅读：[分页模板](/templates/pagination/) · [分页配置](/configuration/pagination/)
