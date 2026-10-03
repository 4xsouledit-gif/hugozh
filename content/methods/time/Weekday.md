+++
title = "Weekday"
linkTitle = "Weekday"
description = "返回给定 time.Time 值所在的星期几。"
date = 2026-10-02
weight = 250
source = "https://gohugo.io/methods/time/weekday/"

[params.functions_and_methods]
signatures = ["TIME.Weekday"]
returnType = "time.Weekday"
+++

把 `time.Weekday` 值转换为字符串：

```go-html-template
{{ $t := time.AsTime "2023-01-27T23:44:58-08:00" }}
{{ $t.Weekday.String }} → Friday
```

把 `time.Weekday` 值转换为整数：

```go-html-template
{{ $t := time.AsTime "2023-01-27T23:44:58-08:00" }}
{{ $t.Weekday | int }} → 5
```
