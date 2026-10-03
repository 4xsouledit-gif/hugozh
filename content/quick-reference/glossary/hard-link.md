+++
title = "硬链接（hard link）"
linkTitle = "硬链接"
description = "允许多个文件名直接指向磁盘上同一份数据的文件系统特性。"
date = 2026-10-02
weight = 510
source = "https://gohugo.io/quick-reference/glossary/hard-link/"

[params.teach]
difficulty = "参考"
prereq = ["在文档里遇到不认识的 Hugo 术语时查阅"]
outcomes = ["能判断两个路径是不是同一份数据，从而解释「改了一个目录，另一个目录也跟着变」"]
next = ["/hugo-modules/use-modules/"]
+++

硬链接（hard link）是一种文件系统特性，它允许多个文件名直接指向磁盘上完全相同的数据。与只引用另一个文件路径的快捷方式或符号链接不同，硬链接是底层内容的同等所有者。通过其中一个名字编辑文件，所有名字看到的都会更新；移动或删除其中一个路径，文件仍保持完好，直到所有相关链接都被删除。

## 为什么重要

它解释了本地开发中一类「灵异现象」：两个目录里的文件看似各有一份，实际指向同一份数据，于是改一处另一处也变，删除其中一个路径后另一个仍能正常读取（磁盘空间也不会释放）。遇到站点里「文件内容自己变了」或同步工具把改动扩散到多处时，先确认两边是否互为硬链接，而不是怀疑 Hugo 的缓存或构建。需要真正独立的两份副本时要复制内容本身，而不是复制链接。

延伸阅读：[使用模块](/hugo-modules/use-modules/)、[模块配置](/configuration/module/)

参见：[硬链接](https://en.wikipedia.org/wiki/Hard_link)
