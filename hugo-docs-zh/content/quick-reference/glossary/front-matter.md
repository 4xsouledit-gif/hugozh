+++
title = "前置元数据（front matter）"
linkTitle = "前置元数据"
description = "每个内容页面开头的元数据，与正文之间用格式相关的定界符分隔。"
date = 2026-10-02
weight = 460
source = "https://gohugo.io/quick-reference/glossary/front-matter/"

[params.teach]
difficulty = "参考"
prereq = ["在文档里遇到不认识的 Hugo 术语时查阅"]
outcomes = ["能写出一段不会解析失败的前置元数据，并在报错指向文件首行时判断问题出在哪里"]
next = ["/content-management/front-matter/"]
+++

前置元数据（front matter）指每个内容页面开头的元数据，它与正文之间用与格式对应的定界符分隔。

## 为什么重要

前置元数据是「页面能不能被正确识别」的第一道关：定界符用错（YAML 的 `---`、TOML 的 `+++`、JSON 的花括号混用），或值里出现冒号、井号等未加引号的字符，Hugo 会直接报解析错误并指向文件开头附近，整个构建中断。另一种不报错的情况是字段名拼错：值写进了 `.Params` 却没人用，表现为标题、日期、排序「改了不生效」，所以排查时先确认定界符与字段名，再怀疑模板。

延伸阅读：[前置元数据](/content-management/front-matter/)、[内容格式](/content-management/formats/)

参见：[前置元数据](/content-management/front-matter/)
