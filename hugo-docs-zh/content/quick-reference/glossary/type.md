+++
title = "类型（type）"
linkTitle = "类型"
description = "即内容类型（content type）。"
date = 2026-10-02
weight = 1450
source = "https://gohugo.io/quick-reference/glossary/type/"

[params.teach]
difficulty = "参考"
prereq = ["在文档里遇到不认识的 Hugo 术语时查阅"]
outcomes = [
  "判断页面渲染异常是模板查找的问题，还是 type 或目录位置不对",
]
next = ["/configuration/content-types/"]
+++

参见[_content type_](g)。

## 为什么重要

内容类型决定 Hugo 去 `layouts` 的哪个子目录找这套页面的模板：写 `type = "docs"` 就用 `layouts/docs/` 下的模板，不写则默认取内容所在的 section。所以「页面能渲染但样式全丢了」或「套用了别的列表页排版」这类现象，多半是 type 或文件目录与模板目录对不上。类型也参与模板查找顺序，排查时先确认页面实际用的 type。

延伸阅读：[内容类型配置](/configuration/content-types/)、[模板查找顺序](/templates/lookup-order/)
