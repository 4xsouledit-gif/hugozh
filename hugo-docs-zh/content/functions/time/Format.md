+++
title = "time.Format"
linkTitle = "Format"
description = "把给定日期/时间返回为格式化并本地化后的字符串。"
date = 2026-10-02
weight = 40
source = "https://gohugo.io/functions/time/format/"

[params.functions_and_methods]
signatures = ["time.Format LAYOUT INPUT"]
returnType = "string"
aliases = ["dateFormat"]
+++

对 `time.Time` 值使用 `time.Format` 函数：

```go-html-template
{{ $t := time.AsTime "2023-10-15T13:18:50-07:00" }}
{{ time.Format "2 Jan 2006" $t }} → 15 Oct 2023
```

也可以对可解析的日期/时间值字符串表示使用 `time.Format`：

```go-html-template
{{ $t := "15 Oct 2023" }}
{{ time.Format "January 2, 2006" $t }} → October 15, 2023
```

可解析的字符串表示示例：

格式|时区
:--|:--
`2023-10-15T13:18:50-07:00`|`America/Los_Angeles`
`2023-10-15T13:18:50-0700`|`America/Los_Angeles`
`2023-10-15T13:18:50Z`|`Etc/UTC`
`2023-10-15T13:18:50`|默认为 `Etc/UTC`
`2023-10-15`|默认为 `Etc/UTC`
`15 Oct 2023`|默认为 `Etc/UTC`

最后三个示例不是完整限定的时间，默认使用 `Etc/UTC` 时区。

要覆盖默认时区，请在项目配置中设置 [`timeZone`][]。确定时区时的优先级顺序为：

1. 日期/时间字符串中的时区偏移
1. 项目配置中指定的时区
1. `Etc/UTC` 时区

## 布局字符串

基于 [Go 的参考时间][Go's reference time]格式化 `time.Time` 值：

```text
Mon Jan 2 15:04:05 MST 2006
```

使用以下组成部分构造布局字符串：

说明|有效组成部分
:--|:--
年|`"2006" "06"`
月|`"Jan" "January" "01" "1"`
星期|`"Mon" "Monday"`
月内日期|`"2" "_2" "02"`
年内日期|`"__2" "002"`
小时|`"15" "3" "03"`
分钟|`"4" "04"`
秒|`"5" "05"`
AM/PM 标记|`"PM"`
时区偏移|`"-0700" "-07:00" "-07" "-070000" "-07:00:00"`

把布局字符串中的符号替换为 Z，UTC 时区就会打印 Z 而不是偏移量。

说明|有效组成部分
:--|:--
时区偏移|`"Z0700" "Z07:00" "Z07" "Z070000" "Z07:00:00"`

```go-html-template
{{ $t := "2023-01-27T23:44:58-08:00" }}
{{ $t = time.AsTime $t }}
{{ $t = $t.Format "Jan 02, 2006 3:04 PM Z07:00" }}

{{ $t }} → Jan 27, 2023 11:44 PM -08:00
```

`PST`、`CET` 这样的字符串不是时区，而是时区*缩写*。

`-07:00`、`+01:00` 这样的字符串不是时区，而是时区*偏移量*。

时区是本地时间相同的一个地理区域。例如，被 `PST` 与 `PDT`（取决于夏令时）缩写的时区是 `America/Los_Angeles`。

[Go's reference time]: https://pkg.go.dev/time#pkg-constants

## 本地化

使用 `time.Format` 函数按当前语言与地区本地化 `time.Time` 值。

> [!NOTE]
> 日期、货币、数字与百分比的本地化由 [`bep/golocales`][] 包完成。Hugo 使用 [`locale`][] 配置项确定地区，未设置时回退到语言键本身。解析出的值必须是该包支持的地区。

[`bep/golocales`]: https://github.com/bep/golocales
[`locale`]: /configuration/all/#locale

可以使用上文所述的布局字符串，也可以使用下面某个标记（token）。例如：

```go-html-template
{{ .Date | time.Format ":date_medium" }} → Jan 27, 2023
```

本地化为 en-US：

标记|结果
:--|:--
`:date_full`|`Friday, January 27, 2023`
`:date_long`|`January 27, 2023`
`:date_medium`|`Jan 27, 2023`
`:date_short`|`1/27/23`
`:time_full`|`11:44:58 pm Pacific Standard Time`
`:time_long`|`11:44:58 pm PST`
`:time_medium`|`11:44:58 pm`
`:time_short`|`11:44 pm`

本地化为 de-DE：

标记|结果
:--|:--
`:date_full`|`Freitag, 27. Januar 2023`
`:date_long`|`27. Januar 2023`
`:date_medium`|`27.01.2023`
`:date_short`|`27.01.23`
`:time_full`|`23:44:58 Nordamerikanische Westküsten-Normalzeit`
`:time_long`|`23:44:58 PST`
`:time_medium`|`23:44:58`
`:time_short`|`23:44`

[`timeZone`]: /configuration/all/#timezone
