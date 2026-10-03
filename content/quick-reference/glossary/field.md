+++
title = "字段（field）"
linkTitle = "字段"
description = "前置元数据中预定义的键值对，例如 `date` 或 `title`。"
date = 2026-10-02
weight = 410
source = "https://gohugo.io/quick-reference/glossary/field/"

[params.teach]
difficulty = "参考"
prereq = ["在文档里遇到不认识的 Hugo 术语时查阅"]
outcomes = ["能判断 front matter 里的键是不是 Hugo 认识的字段，并解释「改了却不生效」的原因"]
next = ["/content-management/front-matter/"]
+++

字段（field）是[front matter](g)（前置元数据）中预定义的键值对，例如 `date` 或 `title`。

## 为什么重要

只有 Hugo 预定义的字段会被站点逻辑直接使用（`title`、`date`、`weight`、`draft` 等），其余键会原样进入 `.Params` 供模板自己取用。最常见的故障是键名拼错：写成 `titel` 或 `draft` 之外的自造名字时 Hugo 不报错，只是该字段「没起作用」——标题回退成文件名、日期排序失效、文章没被标记为草稿，都要靠这一点来排查。分不清「内置字段」与「自定义参数」时，先看前置元数据文档里的字段表。

延伸阅读：[前置元数据](/content-management/front-matter/)、[前置元数据配置](/configuration/front-matter/)
