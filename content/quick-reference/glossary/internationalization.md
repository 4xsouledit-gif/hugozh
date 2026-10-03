+++
title = "国际化（internationalization）"
linkTitle = "国际化"
description = "为实现本地化而进行的软件设计与开发工作。"
date = 2026-10-02
weight = 600
source = "https://gohugo.io/quick-reference/glossary/internationalization/"

[params.teach]
difficulty = "参考"
prereq = ["在文档里遇到不认识的 Hugo 术语时查阅"]
outcomes = ["能判断一个多语言站点缺了哪一环，并说清只翻译正文为什么不够"]
next = ["/content-management/multilingual/"]
+++

国际化（internationalization）指为实现[localization](g)而进行的软件设计与开发工作。

## 为什么重要

给站点加第二种语言时，国际化要落到三件事上：语言配置、按语言组织的内容，以及模板里用 `i18n` 取出的界面文案。只翻译正文、不建 [translation table](g)（翻译表），切换语言后导航、分页、日期这些由模板输出的文字仍会停在默认语言。Hugo 会为每种语言各生成一套站点，因此任何一处没覆盖到，都会在对应语言的页面上直接暴露出来。

延伸阅读：[多语言](/content-management/multilingual/)、[lang.Translate](/functions/lang/translate/)
