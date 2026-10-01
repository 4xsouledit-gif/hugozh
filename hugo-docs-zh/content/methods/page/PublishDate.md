+++
title = "PublishDate"
linkTitle = "PublishDate"
description = "返回给定页面的发布日期。"
date = 2026-10-02
weight = 600
source = "https://gohugo.io/methods/page/publishdate/"

[params.functions_and_methods]
signatures = ["PAGE.PublishDate"]
returnType = "time.Time"
+++

默认情况下，构建项目时 Hugo 会排除发布日期在未来的页面。要包含未来的页面，请使用 `--buildFuture` 命令行参数。

在前置元数据中设置发布日期：

```toml
title = 'Article 1'
publishDate = 2023-10-19T00:40:04-07:00
```

发布日期是一个 [time.Time][] 值。用 [`time.Format`][] 函数格式化并本地化该值，或把它用于任意[时间方法][]。

```go-html-template
{{ .PublishDate | time.Format ":date_medium" }} → Oct 19, 2023
```

上例中我们在前置元数据里显式设置了发布日期。在 Hugo 的默认配置下，`PublishDate` 方法返回前置元数据中的值。该行为可以配置，从而让你在前置元数据未定义发布日期时设置回退值。详见[说明][]。

[`time.Format`]: /functions/time/format/
[details]: /configuration/front-matter/#dates
[time methods]: /methods/time/
[time.Time]: https://pkg.go.dev/time#Time
