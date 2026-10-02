+++
title = "种子（seed）"
linkTitle = "种子"
description = "伪随机数生成算法的起点，相同种子总是产生相同的数字序列。"
date = 2026-10-02
weight = 1230
source = "https://gohugo.io/quick-reference/glossary/seed/"

[params.teach]
difficulty = "参考"
prereq = ["在文档里遇到不认识的 Hugo 术语时查阅"]
outcomes = ["能判断该用接收种子的随机函数还是每次变化的随机函数，并预判构建产物是否稳定"]
next = ["/functions/collections/d/"]
+++

_种子_（seed）是生成伪随机数的计算机算法的起点。使用同一个种子总是产生完全相同的数字序列，这对模拟、密码学和电子游戏等领域的可复现性至关重要。

参见：[随机种子（维基百科）](https://en.wikipedia.org/wiki/Random_seed)

## 为什么重要

Hugo 里需要「可复现的随机」时要显式给出种子，最典型的是 `collections.D`：同一个 seed 跨构建得到同一组数，适合「随机推荐但产物稳定」。`collections.Shuffle` 与 `math.Rand` 不接收种子，每次构建结果都变，会让快照测试与增量部署反复出现差异。想「每天换一批、当天稳定」，常见做法是拿 `time.Now.YearDay` 当种子。

延伸阅读：[collections.D](/functions/collections/d/)、[collections.Shuffle](/functions/collections/shuffle/)
