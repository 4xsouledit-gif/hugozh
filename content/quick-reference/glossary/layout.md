+++
title = "layout"
linkTitle = "layout"
description = "template 的旧称，即模板。"
date = 2026-10-02
weight = 660
source = "https://gohugo.io/quick-reference/glossary/layout/"

[params.teach]
difficulty = "参考"
prereq = ["在文档里遇到不认识的 Hugo 术语时查阅"]
outcomes = ["能判断模板该放在 `layouts` 的哪个位置，并解释改动没生效的原因"]
next = ["/templates/lookup-order/"]
+++

参见[template](g)。

## 为什么重要

layout 是模板的旧称，今天仍出现在 `layouts/` 目录名和模板查找顺序的讨论里。搭站点时真正要小心的不是名字，而是模板放错目录：Hugo 按页面的 [page kind](g) 与类型逐级查找 `layouts` 下的文件，放错位置不会报错，只会静默回退到另一套模板，于是「改动没反应」。

延伸阅读：[模板查找顺序](/templates/lookup-order/)、[模板简介](/templates/introduction/)
