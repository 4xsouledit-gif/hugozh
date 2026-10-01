+++
title = "time.In"
linkTitle = "In"
description = "返回给定日期/时间在指定 IANA 时区中的表示。"
date = 2026-10-02
weight = 50
source = "https://gohugo.io/functions/time/in/"

[params.functions_and_methods]
signatures = ["time.In TIMEZONE INPUT"]
returnType = "time.Time"
+++

**（0.146.0 新增）**

`time.In` 函数返回给定日期/时间在指定 [IANA](g) 时区中的表示。

- 如果时区为空字符串或 `UTC`，时间以 [UTC](g) 返回。
- 如果时区为 `Local`，时间以系统的本地时区返回。
- 其它情况下，时区必须是有效的 IANA [时区名称][time zone name]。

```go-html-template
{{ $layout := "2006-01-02T15:04:05-07:00" }}
{{ $t := time.AsTime "2025-03-31T14:45:00-00:00" }}

{{ $t | time.In "America/Denver" | time.Format $layout }}     → 2025-03-31T08:45:00-06:00
{{ $t | time.In "Australia/Adelaide" | time.Format $layout }} → 2025-04-01T01:15:00+10:30
{{ $t | time.In "Europe/Oslo" | time.Format $layout }}        → 2025-03-31T16:45:00+02:00
```

[time zone name]: https://en.wikipedia.org/wiki/List_of_tz_database_time_zones#List
