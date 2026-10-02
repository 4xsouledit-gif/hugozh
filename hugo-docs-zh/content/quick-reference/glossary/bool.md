+++
title = "bool"
linkTitle = "bool"
description = "布尔值（boolean）在数据类型名中的简写。"
date = 2026-10-02
weight = 70
source = "https://gohugo.io/quick-reference/glossary/bool/"

[params.teach]
difficulty = "参考"
prereq = ["在文档里遇到不认识的 Hugo 术语时查阅"]
outcomes = ["在配置与前置元数据里写出真正被当作布尔值解析的开关"]
next = ["/functions/compare/"]
+++

## bool

参见 [boolean](g)（布尔值）。

## 为什么重要

`bool` 通常只出现在配置键与前置元数据的字段类型说明里。TOML 中 `draft = true` 是布尔值，写成 `draft = "true"` 就变成字符串，而条件判断会把非空字符串当作真——本该是草稿的页面反而会被发布。写布尔字段时不加引号，是最省事的防错办法；改完到构建产物里确认一次开关是否真的生效。

延伸阅读：[比较函数](/functions/compare/) · [前置元数据](/content-management/front-matter/)
