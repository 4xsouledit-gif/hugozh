+++
title = "Month"
linkTitle = "Month"
description = "返回给定 time.Time 值所在的月份。"
date = 2026-10-02
weight = 140
source = "https://gohugo.io/methods/time/month/"

[params.functions_and_methods]
signatures = ["TIME.Month"]
returnType = "time.Month"
+++

把 `time.Month` 值转换为字符串：

```go-html-template
{{ $t := time.AsTime "2023-01-27T23:44:58-08:00" }}
{{ $t.Month.String }} → January
```

把 `time.Month` 值转换为整数：

```go-html-template
{{ $t := time.AsTime "2023-01-27T23:44:58-08:00" }}
{{ $t.Month | int }} → 1
```
