+++
title = "零值时间（zero time）"
linkTitle = "零值时间"
description = "0001 年 1 月 1 日 00:00:00 UTC，按 RFC3339 格式化为 0001-01-01T00:00:00-00:00。"
date = 2026-10-02
weight = 1590
source = "https://gohugo.io/quick-reference/glossary/zero-time/"

[params.teach]
difficulty = "参考"
prereq = ["在文档里遇到不认识的 Hugo 术语时查阅"]
outcomes = [
  "判断页面日期显示成 0001-01-01 的原因，以及该用什么条件判断日期是否设置过",
]
next = ["/methods/page/date/"]
+++

_零值时间_（zero time）是 0001 年 1 月 1 日 00:00:00 UTC。按 [RFC3339][] 格式化，_零值时间_为 0001-01-01T00:00:00-00:00。

## 为什么重要

零值时间的存在感来自「没写日期」：页面的 `date` 缺省时，`.Date` 不是一个空值，而是一个真实的 `time.Time`，直接打印就会得到 `0001-01-01`。更麻烦的是 Go 模板里 `{{ with .Date }}` 永远为真，用它判断「有没有日期」会一路走进零值时间分支。所以判断日期是否设置过要用 `.IsZero`；页脚年份、日期归档、按日期排序里出现 0001 年，基本都是漏了这层判断。

延伸阅读：[Page.Date](/methods/page/date/)、[time.AsTime](/functions/time/astime/)

[RFC3339]: https://www.rfc-editor.org/rfc/rfc3339
