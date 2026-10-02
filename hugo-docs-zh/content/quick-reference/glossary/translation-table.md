+++
title = "翻译表（translation table）"
linkTitle = "翻译表"
description = "i18n 目录中按 RFC 5646 命名、保存单一语言译文的 JSON、TOML 或 YAML 文件。"
date = 2026-10-02
weight = 1440
source = "https://gohugo.io/quick-reference/glossary/translation-table/"

[params.teach]
difficulty = "参考"
prereq = ["在文档里遇到不认识的 Hugo 术语时查阅"]
outcomes = [
  "判断界面文字为什么空白或回退成英文，并知道缺的是哪个文件或哪个键",
]
next = ["/content-management/multilingual/"]
+++

_翻译表_（translation table）是 `i18n` 目录中的 JSON、TOML 或 YAML 文件，按 [RFC 5646][] 命名，保存单一语言的译文。

## 为什么重要

使用 [i18n](g) 的站点里，每个语言都要有自己的翻译表，文件名决定它服务哪个语言（如 `zh-cn.toml`），键则要和模板里取译文的调用写得分毫不差。缺文件或缺键时页面不会报错，只会出现空字符串或英文回退，属于典型的「没报错但结果不对」；用 `hugo --printI18nWarnings` 可以把缺失的译文键列出来。

延伸阅读：[多语言](/content-management/multilingual/)、[语言配置](/configuration/languages/)

[RFC 5646]: https://datatracker.ietf.org/doc/html/rfc5646
