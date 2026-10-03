+++
title = "页面相对（page-relative）"
linkTitle = "页面相对"
description = "相对于当前页面在内容层级中位置解析的路径。"
date = 2026-10-02
weight = 890
source = "https://gohugo.io/quick-reference/glossary/page-relative/"

[params.teach]
difficulty = "参考"
prereq = ["在文档里遇到不认识的 Hugo 术语时查阅"]
outcomes = ["区分页面相对、站点相对与服务器相对三种路径，并知道在页面包与嵌套目录里写引用时以谁为基准"]
next = ["/methods/page/relref/"]
+++

页面相对（page-relative）路径是相对于当前页面在内容层级中的位置解析的。这类路径不以斜杠开头。例如 `old-name`、`./old-name` 和 `../old-name`。

另见：[site-relative](g)、[server-relative](g)。

## 为什么重要

写 `ref` / `relref`、在渲染钩子里改写链接、或引用页面包里的资源时，都要在三种路径写法里选一种，而页面相对是最容易算错的一种：它以**当前页面**为基准，页面挪一层目录，结果就变。
出错时的现象是链接指向了错误的地址，或者构建直接报 `page not found` 一类的解析错误；跨 section 引用时更稳妥的做法是改用根相对的逻辑路径，把基准固定成 `/`。

延伸阅读：[RelRef 方法](/methods/page/relref/) · [URL 管理](/content-management/urls/)
