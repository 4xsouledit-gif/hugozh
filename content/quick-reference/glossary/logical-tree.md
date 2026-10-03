+++
title = "逻辑树（logical tree）"
linkTitle = "逻辑树"
description = "站点中按逻辑路径组织的节点层级。"
date = 2026-10-02
weight = 720
source = "https://gohugo.io/quick-reference/glossary/logical-tree/"

[params.teach]
difficulty = "参考"
prereq = ["在文档里遇到不认识的 Hugo 术语时查阅"]
outcomes = ["能判断面包屑与上一级链接该按什么层级计算，并解释它为什么和目录结构不一致"]
next = ["/content-management/sections/"]
+++

逻辑树（logical tree）是 Hugo 站点中[nodes](g)按[logical paths](g)组织成的层级结构。正如文件路径构成文件树，逻辑路径构成逻辑树。与文件树不同，逻辑树抽象掉了文件扩展名、语言标识和物理目录结构，提供了一致的寻址与导航方式。

参见：[Path](/methods/page/path/#逻辑树)

## 为什么重要

逻辑树决定「这一页属于哪个 section、它的祖先是谁」——面包屑、侧栏导航、`.Parent` 与 `.Ancestors` 都按它计算。它与磁盘目录并不总是一致：同一个逻辑页面还可以有语言、角色、版本等变体，而物理上未必各占一个目录。用文件路径去推层级，在多维站点上就会得到错误的面包屑与上一级链接。

延伸阅读：[Ancestors](/methods/page/ancestors/)、[内容区块](/content-management/sections/)
