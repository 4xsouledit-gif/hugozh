+++
title = "默认站点"
linkTitle = "默认站点"
description = "使用默认语言、默认版本与默认角色的站点。"
date = 2026-10-02
weight = 320
source = "https://gohugo.io/quick-reference/glossary/default-site/"

[params.teach]
difficulty = "参考"
prereq = ["在文档里遇到不认识的 Hugo 术语时查阅"]
outcomes = ["能判断模板里的 site 变量指向哪个站点，并解释多语言站中「列表缺了另一个语言的内容」这类现象"]
next = ["/methods/site/"]
+++

## 默认站点

_默认站点_（default site）是使用[default language](g)、[default version](g)与[default role](g)的那个[site](g)。

## 为什么重要

只要项目启用了多个语言、版本或角色，构建产物里就同时存在多个站点对象，而 `site` 始终指向默认站点。因此在模板里直接用 `site.Pages`、`site.Title` 只会拿到默认语言那一套数据：多语言站点的列表页少了其它语言的内容，首页标题也永远是默认语言的标题——这些都不会报错，只会「少东西」。要覆盖所有站点，需要改用 `sites` 或从当前页面的 `.Site` 出发。

延伸阅读：[Site 方法](/methods/site/)、[多语言](/content-management/multilingual/)
