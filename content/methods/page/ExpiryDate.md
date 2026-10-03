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

## 这一页解决什么问题

`ExpiryDate` 返回页面的**过期时间**（前置元数据 `expiryDate`）。Hugo 默认不发布已过期的页面，因此它有两个用途：在模板里显示「本文已过期」提示；以及解释某个页面为什么没有出现在构建结果里。

## 什么时候用，什么时候别用

**该用**：

- 给过期公告、旧版本页面加提示横幅；
- 在模板里核对某个页面的过期时间。

**别用**：

- 想取**创建/发布**时间 → 用 [`Date`](/methods/page/date/) 或 `.PublishDate`；
- 想取最后更新时间 → 用 [`Lastmod`](/methods/page/lastmod/)；
- 想「手动控制是否发布」→ 默认行为已经排除过期页面，需要保留就加 `--buildExpired`。

## 用法

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

## 完整示例：给过期页面加提示

最小站点：`alpha.md` 写 `expiryDate = 2035-01-01T00:00:00-07:00`（未来，页面照常发布）；`expired.md` 写 `expiryDate = 2024-02-01`（已过去）；`beta.md` 完全不写。模板放在 `layouts/_default/single.html`：

```go-html-template {file="layouts/_default/single.html"}
{{ if .ExpiryDate.IsZero }}
  <p>没有设置过期时间</p>
{{ else }}
  <time datetime="{{ .ExpiryDate.Format "2006-01-02T15:04:05Z07:00" }}">{{ .ExpiryDate | time.Format "2006-01-02" }}</time>
{{ end }}
```

`hugo --source <站点目录> --ignoreCache` 构建后，alpha 输出：

```html
<time datetime="2035-01-01T00:00:00-07:00">2035-01-01</time>
```

beta（没有 `expiryDate`）输出：

```html
<p>没有设置过期时间</p>
```

**你应当看到什么**：`expired.md` 的过期时间已经过去，默认构建后 `public/docs/guide/expired/index.html` **不存在**；加上 `--buildExpired` 才生成。没有设置 `expiryDate` 的页面，`.ExpiryDate` 是**零值时间**（格式化成 `0001-01-01`），必须用 `.IsZero` 判断——`{{ with .ExpiryDate }}` 永远为真，因为 `time.Time` 是结构体。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，Windows；`alpha.md` 的 `expiryDate` 在 2035 年，`expired.md` 的是 2024-02-01，`beta.md` 未设置。

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| 设置了未来的 `expiryDate` | 页面照常发布，值为该时间 | 否 |
| 设置了过去的 `expiryDate` | 页面**不生成**（除非加 `--buildExpired`） | 否 |
| 没有设置 `expiryDate` | 零值时间：`.IsZero` 为 `true`，格式化为 `0001-01-01`，ISO 形式为 `0001-01-01T00:00:00Z` | 否 |
| 用 `{{ with .ExpiryDate }}` 判断 | **永远成立**（结构体） | 否 |
| 返回类型 | `time.Time` | 否 |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 页面莫名消失 | 本地看不到某页面 | `expiryDate` 已经过去 | 检查前置元数据；需要保留就加 `--buildExpired` |
| 页面显示 `0001-01-01` | 直接格式化了未设置的过期时间 | 零值时间被格式化 | 先用 `.ExpiryDate.IsZero` 判断 |
| 没报错但结果不对 | `{{ with .ExpiryDate }}` 总是进入分支 | `time.Time` 是结构体，`with` 对它不判断「零值」 | 改用 `.IsZero` |
| 没报错但结果不对 | 日期比较不生效 | YAML/JSON 或加引号的 TOML 日期是字符串 | 用 TOML 原生日期 |

更多排查入口见[故障排查](/troubleshooting/)。

[`time.Format`]: /functions/time/format/
[说明]: /configuration/front-matter/#dates
[时间方法]: /methods/time/
[time.Time]: https://pkg.go.dev/time#Time
