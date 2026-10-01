+++
title = "time.ParseDuration"
linkTitle = "ParseDuration"
description = "解析给定的时长字符串，返回 time.Duration 值。"
date = 2026-10-02
weight = 70
source = "https://gohugo.io/functions/time/parseduration/"

[params.functions_and_methods]
signatures = ["time.ParseDuration DURATION"]
returnType = "time.Duration"
+++

`time.ParseDuration` 函数返回一个 [`time.Duration`][] 值，可与任意 `Duration` [方法][methods]配合使用。

时长字符串是可能带符号的十进制数序列，每个数可带小数部分与单位后缀，例如 `300ms`、`-1.5h` 或 `2h45m`。有效的时间单位为 `ns`、`us`（或 `µs`）、`ms`、`s`、`m`、`h`。

以下模板：

```go-html-template
{{ $duration := time.ParseDuration "24h" }}
{{ printf "There are %.0f seconds in one day." $duration.Seconds }}
```

渲染为：

```text
There are 86400 seconds in one day.
```

[`time.Duration`]: https://pkg.go.dev/time#Duration
[methods]: /methods/duration/
