+++
title = "默认语言"
linkTitle = "默认语言"
description = "由 defaultContentLanguage 定义的语言，未定义时回退到 en。"
date = 2026-10-02
weight = 300
source = "https://gohugo.io/quick-reference/glossary/default-language/"

[params.teach]
difficulty = "参考"
prereq = ["在文档里遇到不认识的 Hugo 术语时查阅"]
outcomes = ["能判断多语言站里默认语言由谁决定，并解释首页为什么出现在根路径或某个语言子目录下"]
next = ["/configuration/languages/"]
+++

## 默认语言

_默认语言_（default language）是由 [`defaultContentLanguage`][] 设置定义的值；当项目没有定义任何语言时，回退为 `en`。当项目定义了一种或多种语言而没有设置该项时，如果存在名为 `en` 的已启用语言，默认语言就是 `en`，否则是项目中第一个已启用的语言。第一个语言由最低的[weight](g)确定；权重相同或未定义权重时，以字典序作为最终的判定依据。

另见：[language](g)。

## 为什么重要

默认语言决定了根路径（`/`）输出哪一套内容，也决定了 `content/` 根目录下的文件算作哪种语言——改动它等于改站点首页和一批 URL。多语言项目里如果只配置了语言却没写 `defaultContentLanguage`，Hugo 会静默选中 `en` 或权重最低的语言，于是「首页变成了英文」而不报任何错；配合 `defaultContentLanguageInSubdir` 还会改变 URL 是否带语言前缀，旧链接可能成片 404。

延伸阅读：[语言配置](/configuration/languages/)、[多语言](/content-management/multilingual/)

[`defaultContentLanguage`]: /configuration/all/#defaultcontentlanguage
