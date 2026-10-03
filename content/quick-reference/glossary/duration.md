+++
title = "时长"
linkTitle = "时长"
description = "表示一段时间长度的数据类型，单位包括 s、m、h 等。"
date = 2026-10-02
weight = 370
source = "https://gohugo.io/quick-reference/glossary/duration/"

[params.teach]
difficulty = "参考"
prereq = ["在文档里遇到不认识的 Hugo 术语时查阅"]
outcomes = ["能看懂配置和函数里的时长写法，并在报 invalid duration 时知道该改哪里"]
next = ["/methods/duration/"]
+++

## 时长

_时长_（duration）是表示一段时间长度的数据类型，使用的单位包括秒（用 `s` 表示）、分钟（用 `m` 表示）与小时（用 `h` 表示）。例如 `42s` 表示 42 秒，`6m7s` 表示 6 分 7 秒，`6h7m42s` 表示 6 小时 7 分 42 秒。

## 为什么重要

配置项（如缓存有效期 `maxAge`、内置服务器超时）和函数参数都要求这种「数字 + 单位」的字符串：写成裸数字，或把单位写成 Go 不认识的形式（如 `1d`、`6 分钟`），构建会直接报 `invalid duration` / `unknown unit`，报错位置常常只指向配置里的那一行。单位可以组合，`6m7s` 与 `6h7m42s` 都合法；从别处复制来的「1 天」「1 周」这类写法最容易被忽略，因为它在别的工具里是对的。

延伸阅读：[Duration 方法](/methods/duration/)、[缓存配置](/configuration/caches/)
