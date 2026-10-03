+++
title = "页面匹配器（page matcher）"
linkTitle = "页面匹配器"
description = "按逻辑路径、页面类型、环境或站点筛选页面的一组条件。"
date = 2026-10-02
weight = 880
source = "https://gohugo.io/quick-reference/glossary/page-matcher/"

[params.teach]
difficulty = "参考"
prereq = ["在文档里遇到不认识的 Hugo 术语时查阅"]
outcomes = ["看懂 `cascade`、`permalinks` 与构建选项里的筛选条件，并在匹配不生效时知道先查哪几个关键字"]
next = ["/configuration/cascade/"]
+++

页面匹配器（page matcher）是一组条件，用于按 [logical path](g)、[page kind](g)、[environment](g) 或 [site](g) 筛选页面。例如，在配置 [cascade][] 和 [permalink][] 目标时使用页面匹配器。

## 为什么重要

`cascade` 加了却没级联下去、`permalinks` 只对一部分页面生效，通常都是匹配条件没有命中——匹配失败不会报错，Hugo 只是安静地跳过这些页面。
它支持的键是 `environment`、`kind`、`path`、`sites`，值都是 glob 模式（例如 `{taxonomy,term}`、`{/books,/books/**}`），而不是正则表达式；把 `^/books/` 这类正则写法填进 `path`，结果就是匹配不到任何页面。
改完匹配器后，用 `hugo list all` 的 `permalink` 列或模板里的条件分支核对实际命中的页面，比盯着配置猜更可靠。

延伸阅读：[级联配置](/configuration/cascade/) · [glob 模式](/quick-reference/glob-patterns/)

[cascade]: /configuration/cascade/
[permalink]: /configuration/permalinks/
