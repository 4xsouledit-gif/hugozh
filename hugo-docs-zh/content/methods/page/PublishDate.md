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

## 这一页解决什么问题

`.PublishDate` 返回页面的**发布日期**（`time.Time`）。它最常见的用途不是显示，而是**控制构建**：发布日期在未来的页面默认不会被构建；同时它也常被用来生成 `datePublished` 结构化数据、RSS 的 `<pubDate>`。

它和 [`.Date`](/methods/page/date/) 不是同一个字段：`date` 是内容本身的日期，`publishDate` 是「对外发布」的日期。没写 `publishDate` 时，Hugo 会按配置回退（默认回退到 `date`，实测见下）。

## 什么时候用，什么时候别用

**该用**：

- 定时发布：把页面日期设到未来，到点再构建；
- 结构化数据 / RSS / Open Graph 里的「发布时间」；
- 需要在模板里区分「内容日期」与「发布时间」。

**别用**：

- 想要内容日期 → 用 [`.Date`](/methods/page/date/)；
- 想要最后修改时间 → 用 [`.Lastmod`](/methods/page/lastmod/)；
- 想要「过期下线」→ 用 [`.ExpiryDate`](/methods/page/expirydate/) 配合 `--buildExpired`。

**三个日期字段的分工**：

| 字段 | 含义 | 影响构建 |
| --- | --- | --- |
| `date` | 内容日期 | 未来日期的页面默认不构建 |
| `publishDate` | 发布时间 | 未来时间的页面默认不构建；未设置时按配置回退 |
| `lastmod` | 最后修改时间 | 不影响是否构建；影响 sitemap 的 `lastmod` |

## 用法

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

## 完整示例：显式设置与回退

两个内容文件：

```toml
# content/posts/post-1.md（显式设置）
publishDate = 2023-12-01
date = 2024-01-01
```

```toml
# content/posts/bundle-1/index.md（没有 publishDate）
date = 2024-05-01
```

模板：

```go-html-template {file="layouts/_default/single.html"}
<p>PublishDate: {{ .PublishDate | time.Format ":date_medium" }}</p>
<p>Date:        {{ .Date | time.Format "2006-01-02" }}</p>
```

实测（Hugo 0.167.0）：

| 渲染的页面 | `.PublishDate | time.Format ":date_medium"` | `.Date | time.Format "2006-01-02"` |
| --- | --- | --- |
| `/posts/first-post/`（设了 `publishDate = 2023-12-01`） | `Dec 1, 2023` | `2024-01-01` |
| `/posts/bundle-1/`（没有 `publishDate`） | `May 1, 2024` | `2024-05-01` |

**你应当看到什么**：第二行是回退——没有 `publishDate` 时它取到了 `date`。所以「`.PublishDate` 一定等于 front matter 里的 `publishDate`」是错的。

另外实测：测试站里 `date = 2099-01-01` 的页面**没有**出现在 `site.RegularPages` 中（默认不构建未来日期的页面），这与上游对 `--buildFuture` 的说明一致。

## 返回值边界（实测）

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| 前置元数据写了 `publishDate` | 返回该值（实测 `Dec 1, 2023`） | 否 |
| 没写 `publishDate`、写了 `date` | 按默认配置回退到 `date`（实测 `May 1, 2024`） | 否 |
| 两个日期都没写 | 上游未说明；本站测试站每个页面都至少有一个日期，故不列实测输出 | 否 |
| 日期在未来 | 页面默认不参与构建（实测 `2099` 的页面不在 `site.RegularPages` 中）；`hugo --buildFuture` 可包含 | 否 |
| 返回值类型 | `time.Time`（可直接 `.Format`、`.Year`、传给 [`time.Format`](/functions/time/format/)） | 否 |
| 直接打印 | 得到 Go 的默认时间格式（带时区），因此**总是**建议显式格式化 | 否 |

更多排查入口见[故障排查](/troubleshooting/)。

[`time.Format`]: /functions/time/format/
[details]: /configuration/front-matter/#dates
[time methods]: /methods/time/
[time.Time]: https://pkg.go.dev/time#Time
