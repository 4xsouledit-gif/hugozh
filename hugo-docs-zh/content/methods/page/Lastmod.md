+++
title = "Lastmod"
linkTitle = "Lastmod"
description = "返回给定页面的最后修改日期。"
date = 2026-10-02
weight = 400
source = "https://gohugo.io/methods/page/lastmod/"

[params.functions_and_methods]
signatures = ["PAGE.Lastmod"]
returnType = "time.Time"
+++

在前置元数据中设置最后修改日期：

```toml
title = 'Article 1'
lastmod = 2023-10-19T00:40:04-07:00
```

最后修改日期是 [`time.Time`][] 值。可以用 [`time.Format`][] 函数格式化并本地化该值，也可以把它用于任何[时间方法][]。

```go-html-template
{{ .Lastmod | time.Format ":date_medium" }} → Oct 19, 2023
```

上面的例子中，我们在前置元数据里显式设置了最后修改日期。在 Hugo 的默认配置下，`Lastmod` 方法返回前置元数据中的值。这一行为是可配置的，你可以：

- 把最后修改日期设为该文件最后一次 Git 提交的 Author Date。详见 [`GitInfo`][]。
- 当最后修改日期未在前置元数据中定义时，设置回退值。

进一步了解[日期配置][]。

[`GitInfo`]: /methods/page/gitinfo/
[`time.Format`]: /functions/time/format/
[日期配置]: /configuration/front-matter/#dates
[时间方法]: /methods/time/
[`time.Time`]: https://pkg.go.dev/time#Time
