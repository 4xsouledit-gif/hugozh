+++
title = "挂载（mount）"
linkTitle = "挂载"
description = "把文件路径（源）映射到统一文件系统中构件路径（目标）的配置对象。"
date = 2026-10-02
weight = 790
source = "https://gohugo.io/quick-reference/glossary/mount/"

[params.teach]
difficulty = "参考"
prereq = ["在文档里遇到不认识的 Hugo 术语时查阅"]
outcomes = ["能看懂一段挂载配置把哪个目录映射到了哪里，并解释内容为什么没被找到"]
next = ["/configuration/module/"]
+++

挂载（mount）是一种配置对象，它把文件路径（源）映射到 Hugo [unified file system](g)中某个[component](g)的路径（目标）。

参见：[模块配置](/configuration/module/)

## 为什么重要

挂载决定 Hugo 去哪儿找内容、模板和静态文件：它把磁盘上的路径映射到统一文件系统里某个构件的目录。源路径或目标写错时，最典型的现象是「文件明明在，站点里却没有」，或者生成的 URL 与目录结构对不上。引入主题或 [module](g)（模块）时，挂载还是让不同来源的同名目录叠加到一起的手段。

延伸阅读：[模块配置](/configuration/module/)、[主题组件](/hugo-modules/theme-components/)
