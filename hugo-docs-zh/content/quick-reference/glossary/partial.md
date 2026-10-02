+++
title = "局部模板（partial）"
linkTitle = "局部模板"
description = "partial template 的简称。"
date = 2026-10-02
weight = 980
source = "https://gohugo.io/quick-reference/glossary/partial/"

[params.teach]
difficulty = "参考"
prereq = ["在文档里遇到不认识的 Hugo 术语时查阅"]
outcomes = ["在文档里看到 partial 时知道它指局部模板，并知道该去哪个目录找、用哪个函数调用"]
next = ["/functions/partials/include/"]
+++

参见 [partial template](g)。

## 为什么重要

文档、报错信息和社区回答里经常把 partial 与 partial template 混着用，指的都是同一件事：放在 `layouts/_partials/`（经典布局下是 `layouts/partials/`）下、可被其他模板调用的片段。
认准这条线索后，遇到 `partial not found` 一类报错时，先用文件路径核对名字，而不是去翻站点配置——Hugo 按名字查找文件，名字对不上不会有任何回退。

延伸阅读：[partials.Include](/functions/partials/include/) · [局部模板装饰器](/templates/partial-decorators/)
