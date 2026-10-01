+++
title = "Date"
linkTitle = "Date"
description = "返回给定页面的日期。"
date = 2026-10-02
weight = 120
source = "https://gohugo.io/methods/page/date/"

[params.functions_and_methods]
signatures = ["PAGE.Date"]
returnType = "time.Time"
+++

在前置元数据中设置日期：

```toml
title = 'Article 1'
date = 2023-10-19T00:40:04-07:00
```

> [!NOTE]
> 前置元数据中的 `date` 字段常被视为创建日期。你可以在项目配置中改变它的含义及其对项目的影响。详见[说明][]。

日期是 [time.Time][] 值。可以用 [`time.Format`][] 函数格式化并本地化该值，也可以把它用于任何[时间方法][]。

```go-html-template
{{ .Date | time.Format ":date_medium" }} → Oct 19, 2023
```

上面的例子中，我们在前置元数据里显式设置了日期。在 Hugo 的默认配置下，`Date` 方法返回前置元数据中的值。这一行为是可配置的：当日期的确没有在前置元数据中定义时，你可以设置回退值。详见[说明][]。

[`time.Format`]: /functions/time/format/
[说明]: /configuration/front-matter/#dates
[时间方法]: /methods/time/
[time.Time]: https://pkg.go.dev/time#Time
