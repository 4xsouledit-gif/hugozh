+++
title = "Lastmod"
linkTitle = "Lastmod"
description = "返回站点内容的最后修改日期。"
date = 2026-10-02
weight = 140
source = "https://gohugo.io/methods/site/lastmod/"

[params.functions_and_methods]
signatures = ["SITE.Lastmod"]
returnType = "time.Time"
+++

`Site` 对象上的 `Lastmod` 方法返回一个 [`time.Time`][] 值。请把它与时间[函数][]和[方法][]配合使用。例如：

```go-html-template
{{ .Site.Lastmod | time.Format ":date_long" }} → January 31, 2024

```

[`time.Time`]: https://pkg.go.dev/time#Time
[函数]: /functions/time/
[方法]: /methods/time/
