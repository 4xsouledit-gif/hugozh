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

## 这一页解决什么问题

`Date` 返回页面的**创建 / 发布日期**（`time.Time` 值）。列表排序、`<time datetime>`、RSS 的 `pubDate`、按年份归档，都以它为准。

## 什么时候用，什么时候别用

**该用**：

- 显示或格式化文章日期；
- 用日期排序、筛选（`sort .Pages "Date" "desc"`、`where .Pages "Date" "gt" $t`）；
- 输出机器可读时间：`<time datetime="…">`。

**别用**：

- 显示**最后更新**时间 → 用 [`Lastmod`](/methods/page/lastmod/)；
- 显示**过期**时间 → 用 [`ExpiryDate`](/methods/page/expirydate/)；
- 显示计划发布时间 → 用 `.PublishDate`；
- 把日期当**字符串**比较 → TOML 里不加引号的日期才是 `time.Time`，加了引号就退化成字符串，比较结果会不对。

## 用法

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

## 完整示例：格式化日期并输出机器可读时间

最小站点：`content/docs/guide/alpha.md` 的前置元数据写 `date = 2023-10-19T00:40:04-07:00`（TOML 原生日期，**不加引号**）。模板放在 `layouts/_default/single.html`：

```go-html-template {file="layouts/_default/single.html"}
<p>{{ .Date | time.Format ":date_medium" }}</p>
<time datetime="{{ .Date.Format "2006-01-02T15:04:05Z07:00" }}">{{ .Date | time.Format "2006-01-02" }}</time>
```

`hugo --source <站点目录> --ignoreCache` 构建后：

```html
<p>Oct 19, 2023</p>
<time datetime="2023-10-19T00:40:04-07:00">2023-10-19</time>
```

**你应当看到什么**：`:date_medium` 输出 `Oct 19, 2023`，与上游示例一致；即使站点是中文（`locale = 'zh-CN'`），这个 Hugo 版本也没有把 `:date_medium` 本地化成中文——需要中文日期时自己写布局字符串（例如 `2006 年 1 月 2 日`）。时区**原样保留**在 `datetime` 里。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，Windows；双语言站点（`locale = 'zh-CN'`）。

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| 前置元数据写了 `date`（TOML 原生日期） | 该 `time.Time` 值，含时区偏移 | 否 |
| 把日期写成带引号的字符串 | 退化为字符串，无法与 `time.Time` 比较 | 否（但不报错，结果会错） |
| `time.Format "2006-01-02T15:04:05Z07:00"` | `2023-10-19T00:40:04-07:00` | 否 |
| `time.Format ":date_medium"` | `Oct 19, 2023`（中文站点也未本地化） | 否 |
| 页面没有 `date` | 由[前置元数据日期配置](/configuration/front-matter/#dates)决定回退值 | 否 |
| 返回类型 | `time.Time`（不是字符串，不能直接 `eq` 比较字符串） | 否 |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 没报错但结果不对 | 日期排序/筛选结果怪异 | YAML/JSON 或加引号的 TOML 日期是字符串 | 用 TOML 且不加引号；或先 `time.AsTime` |
| 没报错但结果不对 | 页面显示 `0001-01-01` | 没有 `date` 且没有配置回退值 | 在[日期配置](/configuration/front-matter/#dates)里设置回退，或模板用 `.Date.IsZero` 判断 |
| 日期差一天 | 输出的日期与预期差一天 | 时区：`time.Format` 按值本身的时区渲染 | 明确写偏移量，或先用 `.Date.UTC` / `.Date.Local` |

更多排查入口见[故障排查](/troubleshooting/)。

[`time.Format`]: /functions/time/format/
[说明]: /configuration/front-matter/#dates
[时间方法]: /methods/time/
[time.Time]: https://pkg.go.dev/time#Time
