+++
title = "逻辑路径（logical path）"
linkTitle = "逻辑路径"
description = "由文件路径推导出的页面或页面资源标识符，不含扩展名与语言标识。"
date = 2026-10-02
weight = 710
source = "https://gohugo.io/quick-reference/glossary/logical-path/"
+++

逻辑路径（logical path）是由文件路径推导出的页面或页面资源标识符，其中不包含扩展名和语言标识。它既不是文件路径，也不是 URL。Hugo 从相对于 `content` 目录的文件路径出发，去掉文件扩展名和语言标识，转换为小写，再把空格替换为连字符，从而得到逻辑路径。路径各段之间用斜杠（`/`）分隔。

用于描述内容时，逻辑路径是[logical tree](g)中两个[nodes](g)之间的路径，既可以是二者之间的相对路径，也可以是从树根算起的绝对路径。

参见：[Path](/methods/page/path/#logical-tree)
