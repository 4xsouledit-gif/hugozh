+++
title = "Format"
linkTitle = "Format"
description = "按布局字符串返回 time.Time 值的文本表示。"
date = 2026-10-02
weight = 80
source = "https://gohugo.io/methods/time/format/"
aliases = ["/methods/time/format"]

[params.functions_and_methods]
signatures = ["TIME.Format LAYOUT"]
returnType = "string"
+++

```go-template
{{ $t := "2023-01-27T23:44:58-08:00" }}
{{ $t = time.AsTime $t }}
{{ $format := "2 Jan 2006" }}

{{ $t.Format $format }} → 27 Jan 2023
```

> [!NOTE]
> 若要对返回值做 [localization](g)（本地化），请改用 [`time.Format`][] 函数。

`Format` 方法可用于任何 `time.Time` 值，包括前置元数据中四个预定义的日期：

```go-html-template
{{ $format := "2 Jan 2006" }}

{{ .Date.Format $format }}
{{ .PublishDate.Format $format }}
{{ .ExpiryDate.Format $format }}
{{ .Lastmod.Format $format }}
```

> [!NOTE]
> 若要格式化日期的字符串表示，以及格式化不含时间和时区偏移的原始 TOML 日期，请使用 [`time.Format`][] 函数。

## 布局字符串

按 [Go 的参考时间][]格式化 `time.Time` 值：

```text
Mon Jan 2 15:04:05 MST 2006
```

用下列组件构造布局字符串：

说明|可用组件
:--|:--
年|`"2006" "06"`
月|`"Jan" "January" "01" "1"`
星期几|`"Mon" "Monday"`
月份中的日期|`"2" "_2" "02"`
一年中的第几天|`"__2" "002"`
小时|`"15" "3" "03"`
分钟|`"4" "04"`
秒|`"5" "05"`
上午/下午标记|`"PM"`
时区偏移|`"-0700" "-07:00" "-07" "-070000" "-07:00:00"`

把布局字符串中的符号替换为 Z，UTC 时区就会打印 Z 而不是偏移量。

说明|可用组件
:--|:--
时区偏移|`"Z0700" "Z07:00" "Z07" "Z070000" "Z07:00:00"`

```go-html-template
{{ $t := "2023-01-27T23:44:58-08:00" }}
{{ $t = time.AsTime $t }}
{{ $t = $t.Format "Jan 02, 2006 3:04 PM Z07:00" }}

{{ $t }} → Jan 27, 2023 11:44 PM -08:00
```

`PST`、`CET` 这样的字符串不是时区，而是时区_缩写_。

`-07:00`、`+01:00` 这样的字符串不是时区，而是时区_偏移量_。

时区是指本地时间相同的一个地理区域。例如，缩写为 `PST` 和 `PDT`（取决于夏令时）的时区是 `America/Los_Angeles`。

[Go 的参考时间]: https://pkg.go.dev/time#pkg-constants

## 示例

给定如下前置元数据：

```toml
title = "About time"
date = 2023-01-27T23:44:58-08:00
```

下面的示例在 `America/Los_Angeles` 时区中渲染：

格式字符串|结果
:--|:--
`Monday, January 2, 2006`|`Friday, January 27, 2023`
`Mon Jan 2 2006`|`Fri Jan 27 2023`
`January 2006`|`January 2023`
`2006-01-02`|`2023-01-27`
`Monday`|`Friday`
`02 Jan 06 15:04 MST`|`27 Jan 23 23:44 PST`
`Mon, 02 Jan 2006 15:04:05 MST`|`Fri, 27 Jan 2023 23:44:58 PST`
`Mon, 02 Jan 2006 15:04:05 -0700`|`Fri, 27 Jan 2023 23:44:58 -0800`

## UTC 与本地时间

把任何 `time.Time` 值转换并格式化为协调世界时（UTC）或本地时间。

```go-html-template
{{ $t := "2023-01-27T23:44:58-08:00" }}
{{ $t = time.AsTime $t }}
{{ $format := "2 Jan 2006 3:04:05 PM MST" }}

{{ $t.UTC.Format $format }} → 28 Jan 2023 7:44:58 AM UTC
{{ $t.Local.Format $format }} → 27 Jan 2023 11:44:58 PM PST
```

## 序数表示

使用 [`humanize`][] 函数把月份中的日期渲染为序数：

```go-html-template
{{ $t := "2023-01-27T23:44:58-08:00" }}
{{ $t = time.AsTime $t }}

{{ humanize $t.Day }} of {{ $t.Format "January 2006" }} → 27th of January 2023
```

[`humanize`]: /functions/inflect/humanize/
[`time.Format`]: /functions/time/format/
