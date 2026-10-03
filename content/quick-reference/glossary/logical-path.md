+++
title = "逻辑路径（logical path）"
linkTitle = "逻辑路径"
description = "由文件路径推导出的页面或页面资源标识符，不含扩展名与语言标识。"
date = 2026-10-02
weight = 710
source = "https://gohugo.io/quick-reference/glossary/logical-path/"

[params.teach]
difficulty = "参考"
prereq = ["在文档里遇到不认识的 Hugo 术语时查阅"]
outcomes = ["能按逻辑路径规则写出取页面的路径，并判断找不到页面是不是大小写或空格的问题"]
next = ["/methods/page/path/"]
+++

逻辑路径（logical path）是由文件路径推导出的页面或页面资源标识符，其中不包含扩展名和语言标识。它既不是文件路径，也不是 URL。Hugo 从相对于 `content` 目录的文件路径出发，去掉文件扩展名和语言标识，转换为小写，再把空格替换为连字符，从而得到逻辑路径。路径各段之间用斜杠（`/`）分隔。

用于描述内容时，逻辑路径是[logical tree](g)中两个[nodes](g)之间的路径，既可以是二者之间的相对路径，也可以是从树根算起的绝对路径。

参见：[Path](/methods/page/path/#逻辑树)

## 为什么重要

`GetPage`、`ref`/`relref`、cascade 与 segments 里写的都是逻辑路径，而不是磁盘上的文件路径或最终 URL。它会被转成小写、空格换成连字符，所以 `content/My Post.md` 要用 `/my-post` 去找；照文件名原样去写通常拿不到页面，而 Hugo 只会返回空或报找不到，不会提示你「大小写错了」。

延伸阅读：[Path](/methods/page/path/)、[GetPage](/methods/page/getpage/)
