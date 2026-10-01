+++
title = "管道（pipeline）"
linkTitle = "管道"
description = "模板动作中可能串联的值、函数调用或方法调用序列。"
date = 2026-10-02
weight = 1010
source = "https://gohugo.io/quick-reference/glossary/pipeline/"
+++

管道（pipeline）是 [template action](g) 中可能串联的值、[function](g) 调用或 [method](g) 调用序列。管道中的函数和方法可以接收多个 [arguments](g)。

管道可以通过管道字符（`|`）分隔一系列命令来串联。在串联的管道中，每个命令的结果作为最后一个参数传给下一个命令。管道中最后一个命令的输出就是该管道的值。
