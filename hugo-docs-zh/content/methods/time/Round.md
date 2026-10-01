+++
title = "Round"
linkTitle = "Round"
description = "返回把 TIME 舍入到自 0001 年 1 月 1 日 00:00:00 UTC 起最接近 DURATION 整数倍后的结果。"
date = 2026-10-02
weight = 160
source = "https://gohugo.io/methods/time/round/"

[params.functions_and_methods]
signatures = ["TIME.Round DURATION"]
returnType = "time.Time"
+++

对中间值的舍入行为是向上舍入。

`Round` 方法把 TIME 当作自 [zero time](g)（零时刻）起的绝对时长来处理，而不是对时间的呈现形式进行操作。如果 DURATION 是一小时的整数倍，`Round` 返回的时间的分钟数可能不为零，具体取决于时区。

```go-html-template
{{ $t := time.AsTime "2023-01-27T23:44:58-08:00" }}
{{ $d := time.ParseDuration "1h" }}

{{ ($t.Round $d).Format "2006-01-02T15:04:05-00:00" }} → 2023-01-28T00:00:00-00:00
```
