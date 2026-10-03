+++
title = "本地化（localization）"
linkTitle = "本地化"
description = "让站点满足语言与地区要求的过程，涵盖翻译、日期与数字格式等。"
date = 2026-10-02
weight = 700
source = "https://gohugo.io/quick-reference/glossary/localization/"

[params.teach]
difficulty = "参考"
prereq = ["在文档里遇到不认识的 Hugo 术语时查阅"]
outcomes = ["能判断一个多语言站点除了翻译还缺什么，并说清格式没对齐会看到什么"]
next = ["/content-management/multilingual/"]
+++

本地化（localization）指让站点满足语言与地区要求的过程。这包括翻译、日期格式、数字格式、货币格式以及排序规则。

参见：[多语言](/content-management/multilingual/)

## 为什么重要

本地化不只是把文字翻过去：日期、数字、货币的写法也随语言变化，Hugo 为此提供了 `lang.FormatNumber`、`lang.FormatCurrency` 这类函数。只翻译正文、不管格式，页面上会出现英文日期顺序或错误的千分位，读者一眼就能看出这个站点「没做完」。翻译表与语言配置共同决定这些细节能不能落地。

延伸阅读：[多语言](/content-management/multilingual/)、[lang.FormatNumber](/functions/lang/formatnumber/)
