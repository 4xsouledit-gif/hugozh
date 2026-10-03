+++
title = "序列化（marshal）"
linkTitle = "序列化"
description = "把数据结构转换为序列化对象，例如把映射转换为 JSON 字符串。"
date = 2026-10-02
weight = 750
source = "https://gohugo.io/quick-reference/glossary/marshal/"

[params.teach]
difficulty = "参考"
prereq = ["在文档里遇到不认识的 Hugo 术语时查阅"]
outcomes = ["能判断该序列化还是反序列化，并从输出里的转义字符认出方向搞反了"]
next = ["/functions/transform/remarshal/"]
+++

序列化（marshal，动词）是把数据结构转换为序列化对象，例如把[map](g)转换为 JSON 字符串。

参见：[transform.Remarshal](/functions/transform/remarshal/)

## 为什么重要

要把模板里的数据结构变成 JSON 字符串（自定义输出格式、搜索索引、喂给前端脚本的数据）时，用的就是序列化；`transform.Remarshal` 是模板里最常用的入口。方向搞反——把已经是 JSON 的字符串再序列化一次——输出里会出现成串的 `\"` 转义，这是最容易辨认的症状。调试时先把结果输出到页面上看一眼，比盯着模板猜快得多。

延伸阅读：[transform.Remarshal](/functions/transform/remarshal/)、[输出格式配置](/configuration/output-formats/)
