+++
title = "CJK"
linkTitle = "CJK"
description = "中文、日文与韩文三种语言的统称。"
date = 2026-10-02
weight = 190
source = "https://gohugo.io/quick-reference/glossary/cjk/"

[params.teach]
difficulty = "参考"
prereq = ["在文档里遇到不认识的 Hugo 术语时查阅"]
outcomes = ["判断摘要长度、词数、阅读时间这类数值为什么对中文站点不适用，并知道去哪一页核对"]
next = ["/content-management/summaries/"]
+++

## CJK

_CJK_ 是对中文、日文与韩文三种语言的统称。

## 为什么重要

CJK 文本不用空格分词，而 `.WordCount`、`.Summary`、`truncate` 默认按空格与词边界处理，对这类文本会算出偏小的词数，或把摘要切在奇怪的位置。站点以 CJK 为主时，摘要长度、阅读时间、列表节选都要按这个前提实测，不能照搬英文站点的数值。改完摘要设置后，用构建产物里的节选文本核对一次。

延伸阅读：[摘要](/content-management/summaries/) · [多语言](/content-management/multilingual/)
