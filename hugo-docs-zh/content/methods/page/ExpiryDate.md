+++
title = "ExpiryDate"
linkTitle = "ExpiryDate"
description = "返回给定页面的过期日期。"
date = 2026-10-02
weight = 160
source = "https://gohugo.io/methods/page/expirydate/"

[params.functions_and_methods]
signatures = ["PAGE.ExpiryDate"]
returnType = "time.Time"
+++

默认情况下，构建项目时 Hugo 会排除已过期的页面。要包含已过期的页面，请使用 `--buildExpired` 命令行标志。

在前置元数据中设置过期日期：

```toml
title = 'Article 1'
expiryDate = 2024-10-19T00:32:13-07:00
```

过期日期是 [time.Time][] 值。可以用 [`time.Format`][] 函数格式化并本地化该值，也可以把它用于任何[时间方法][]。

```go-html-template
{{ .ExpiryDate | time.Format ":date_medium" }} → Oct 19, 2024
```

上面的例子中，我们在前置元数据里显式设置了过期日期。在 Hugo 的默认配置下，`ExpiryDate` 方法返回前置元数据中的值。这一行为是可配置的：当过期日期的确没有在前置元数据中定义时，你可以设置回退值。详见[说明][]。

[`time.Format`]: /functions/time/format/
[说明]: /configuration/front-matter/#dates
[时间方法]: /methods/time/
[time.Time]: https://pkg.go.dev/time#Time
