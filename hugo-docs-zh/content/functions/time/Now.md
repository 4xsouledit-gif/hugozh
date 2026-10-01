+++
title = "time.Now"
linkTitle = "Now"
description = "返回当前本地时间。"
date = 2026-10-02
weight = 60
source = "https://gohugo.io/functions/time/now/"

[params.functions_and_methods]
signatures = ["time.Now"]
returnType = "time.Time"
aliases = ["now"]
+++

例如，在 America/Los_Angeles 时区的 2023 年 10 月 15 日构建站点时：

```go-html-template
{{ time.Now }}
```

这会生成一个 `time.Time` 值，其字符串表示类似：

```text
2023-10-15 12:59:28.337140706 -0700 PDT m=+0.041752605
```

要格式化并[本地化](g)该值，请把它传给 [`time.Format`][] 函数：

```go-html-template
{{ time.Now | time.Format "Jan 2006" }} → Oct 2023
```

`time.Now` 函数返回 `time.Time` 值，因此可以对结果链式调用任意[时间方法][time methods]。例如：

```go-html-template
{{ time.Now.Year }} → 2023 (int)
{{ time.Now.Weekday.String }} → Sunday
{{ time.Now.Month.String }} → October
{{ time.Now.Unix }} → 1697400955 (int64)
```

[`time.Format`]: /functions/time/format/
[time methods]: /methods/time/
