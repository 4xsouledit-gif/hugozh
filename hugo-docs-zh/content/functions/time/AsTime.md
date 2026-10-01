+++
title = "time.AsTime"
linkTitle = "AsTime"
description = "把日期/时间值的给定字符串表示返回为 time.Time 值。"
date = 2026-10-02
weight = 20
source = "https://gohugo.io/functions/time/astime/"

[params.functions_and_methods]
signatures = ["time.AsTime INPUT [TIMEZONE]"]
returnType = "time.Time"
aliases = ["time"]
+++

## 概述

Hugo 提供了[函数][functions]与[方法][methods]来格式化、本地化、解析、比较与操作日期/时间值。要对日期/时间值的字符串表示做这些操作，必须先使用 `time.AsTime` 函数把它们转换成 [`time.Time`][] 值。

```go-html-template
{{ $t := "2023-10-15T13:18:50-07:00" }}
{{ time.AsTime $t }} → 2023-10-15 13:18:50 -0700 PDT (time.Time)
```

## 可解析的字符串

如上所示，第一个参数必须是可解析的日期/时间值字符串表示。例如：

格式|时区
:--|:--
`2023-10-15T13:18:50-07:00`|`America/Los_Angeles`
`2023-10-15T13:18:50-0700`|`America/Los_Angeles`
`2023-10-15T13:18:50Z`|`Etc/UTC`
`2023-10-15T13:18:50`|默认为 `Etc/UTC`
`2023-10-15`|默认为 `Etc/UTC`
`15 Oct 2023`|默认为 `Etc/UTC`

最后三个示例不是完整限定的时间，默认使用 `Etc/UTC` 时区。

要覆盖默认时区，请在项目配置中设置 [`timeZone`][]，或给 `time.AsTime` 函数传入第二个参数。例如：

```go-html-template
{{ time.AsTime "15 Oct 2023" "America/Los_Angeles" }}
```

有效时区列表可能因系统而异，但应当包含 `UTC`、`Local`，或 [IANA 时区数据库][IANA Time Zone database]中的任何位置。

确定时区时的优先级顺序为：

1. 日期/时间字符串中的时区偏移
1. 传给 `time.AsTime` 函数的第二个参数所指定的时区
1. 项目配置中指定的时区
1. `Etc/UTC` 时区

[IANA Time Zone database]: https://en.wikipedia.org/wiki/List_of_tz_database_time_zones
[`time.Time`]: https://pkg.go.dev/time#Time
[`timeZone`]: /configuration/all/#timezone
[functions]: /functions/time/
[methods]: /methods/time/
