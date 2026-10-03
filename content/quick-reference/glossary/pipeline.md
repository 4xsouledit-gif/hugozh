+++
title = "管道（pipeline）"
linkTitle = "管道"
description = "模板动作中可能串联的值、函数调用或方法调用序列。"
date = 2026-10-02
weight = 1010
source = "https://gohugo.io/quick-reference/glossary/pipeline/"

[params.teach]
difficulty = "参考"
prereq = ["在文档里遇到不认识的 Hugo 术语时查阅"]
outcomes = ["读懂模板里带 `|` 的动作，并知道管道值会落到目标函数的哪个参数位置"]
next = ["/templates/introduction/"]
+++

管道（pipeline）是 [template action](g) 中可能串联的值、[function](g) 调用或 [method](g) 调用序列。管道中的函数和方法可以接收多个 [arguments](g)。

管道可以通过管道字符（`|`）分隔一系列命令来串联。在串联的管道中，每个命令的结果作为最后一个参数传给下一个命令。管道中最后一个命令的输出就是该管道的值。

## 为什么重要

拿到一个值后要连着做几步处理（取资源 → 压缩 → 加指纹）时，管道写法最贴近数据流动方向；被管道传入的值永远是最后一个参数，所以带选项的函数要写成 `f $opts VALUE`，在管道里就是 `VALUE | f $opts`。
结果不对时，可以先在管道末尾接一个输出到构建日志的函数（例如 `warnf`，见故障排查里的日志一节）把中间值打出来，比反复改模板快；报错提到参数个数时，先核对参数顺序，而不是怀疑函数名。

延伸阅读：[模板简介](/templates/introduction/) · [日志与警告](/troubleshooting/logging/)
