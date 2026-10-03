+++
title = "语言（language）"
linkTitle = "语言"
description = "用于内容本地化与国际化的一种维度。"
date = 2026-10-02
weight = 650
source = "https://gohugo.io/quick-reference/glossary/language/"

[params.teach]
difficulty = "参考"
prereq = ["在文档里遇到不认识的 Hugo 术语时查阅"]
outcomes = ["能判断一个多语言项目缺了哪一步，并解释语言目录为什么会被当成普通目录"]
next = ["/configuration/languages/"]
+++

语言（language）是一种[dimension](g)，用于实现内容的本地化与国际化。[version](g) 关注生命周期，[role](g) 关注受众，而语言这一维度让同一个逻辑页面在项目中以不同区域（locale）的形态呈现。

另请参见：[default language](g)。

## 为什么重要

在配置里声明语言之后，每条内容都能按语言生成各自的版本，[default language](g)（默认语言）决定没有翻译时回落到哪一种。只建了 `content/zh-cn/` 却没在配置里声明，这个目录会被当成普通内容目录，语言切换器和 `.Translations` 都拿不到东西。多语言站点的 URL 前缀、[translation table](g) 查找与内容变体，全都建立在这个维度上。

延伸阅读：[语言配置](/configuration/languages/)、[多语言](/content-management/multilingual/)
