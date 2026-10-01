+++
title = "AddDate"
linkTitle = "AddDate"
description = "返回给定 time.Time 值加上指定的年、月、日之后对应的时间。"
date = 2026-10-02
weight = 30
source = "https://gohugo.io/methods/time/adddate/"
aliases = ["/functions/adddate"]

[params.functions_and_methods]
signatures = ["TIME.AddDate YEARS MONTHS DAYS"]
returnType = "time.Time"
+++

```go-html-template
{{ $d := "2022-01-01" | time.AsTime }}

{{ $d.AddDate 0 0 1 | time.Format "2006-01-02" }} → 2022-01-02
{{ $d.AddDate 0 1 1 | time.Format "2006-01-02" }} → 2022-02-02
{{ $d.AddDate 1 1 1 | time.Format "2006-01-02" }} → 2023-02-02

{{ $d.AddDate -1 -1 -1 | time.Format "2006-01-02" }} → 2020-11-30
```

> [!NOTE]
> 加上月份或年份时，如果得到的日期并不存在，Hugo 会归一化最终的 `time.Time` 值。例如给 1 月 31 日加一个月，会得到 3 月 2 日或 3 月 3 日，具体取决于年份。
>
> 参见 Go 团队的[这段说明][]。

```go-html-template
{{ $d := "2023-01-31" | time.AsTime }}
{{ $d.AddDate 0 1 0 | time.Format "2006-01-02" }} → 2023-03-03

{{ $d := "2024-01-31" | time.AsTime }}
{{ $d.AddDate 0 1 0 | time.Format "2006-01-02" }} → 2024-03-02

{{ $d := "2024-02-29" | time.AsTime }}
{{ $d.AddDate 1 0 0 | time.Format "2006-01-02" }} → 2025-03-01
```

[这段说明]: https://github.com/golang/go/issues/31145#issuecomment-479067967
