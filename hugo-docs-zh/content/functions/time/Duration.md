+++
title = "time.Duration"
linkTitle = "Duration"
description = "使用给定的时间单位与数值返回 time.Duration 值。"
date = 2026-10-02
weight = 30
source = "https://gohugo.io/functions/time/duration/"

[params.functions_and_methods]
signatures = ["time.Duration TIME_UNIT NUMBER"]
returnType = "time.Duration"
aliases = ["duration"]
+++

`time.Duration` 函数返回一个 [`time.Duration`][] 值，可与任意 `Duration` [方法][methods]配合使用。

以下模板：

```go-html-template
{{ $duration := time.Duration "hour" 24 }}
{{ printf "There are %.0f seconds in one day." $duration.Seconds }}
```

渲染为：

```text
There are 86400 seconds in one day.
```

时间单位必须是以下之一：

时长|有效时间单位
:--|:--
hours|`hour`, `h`
minutes|`minute`, `m`
seconds|`second`, `s`
milliseconds|`millisecond`, `ms`
microseconds|`microsecond`, `us`, `µs`
nanoseconds|`nanosecond`, `ns`

[`time.Duration`]: https://pkg.go.dev/time#Duration
[methods]: /methods/duration/
