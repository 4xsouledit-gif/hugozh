+++
title = "硬链接（hard link）"
linkTitle = "硬链接"
description = "允许多个文件名直接指向磁盘上同一份数据的文件系统特性。"
date = 2026-10-02
weight = 510
source = "https://gohugo.io/quick-reference/glossary/hard-link/"
+++

硬链接（hard link）是一种文件系统特性，它允许多个文件名直接指向磁盘上完全相同的数据。与只引用另一个文件路径的快捷方式或符号链接不同，硬链接是底层内容的同等所有者。通过其中一个名字编辑文件，所有名字看到的都会更新；移动或删除其中一个路径，文件仍保持完好，直到所有相关链接都被删除。

参见：[硬链接](https://en.wikipedia.org/wiki/Hard_link)
