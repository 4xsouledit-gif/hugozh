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

## 这一页解决什么问题

`Lastmod` 返回页面的**最后修改时间**。它既可以由前置元数据显式给出，也可以在启用 Git 集成后自动取该文件最后一次提交的日期——「本页最后更新于」这类信息就来自它。

## 什么时候用，什么时候别用

**该用**：

- 显示「最后更新」；
- 输出 `<time datetime>` 或 sitemap 的 `lastmod` 字段。

**别用**：

- 想取**创建/发布**时间 → 用 [`Date`](/methods/page/date/)；
- 想取过期时间 → 用 [`ExpiryDate`](/methods/page/expirydate/)；
- 用 `{{ with .Lastmod }}` 判断「有没有设置」→ `time.Time` 是结构体，`with` 恒为真。

## 用法

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

## 完整示例：输出机器可读的最后更新时间

最小站点：`content/docs/guide/alpha.md` 的前置元数据写了 `lastmod = 2024-05-06T11:22:33-07:00`；`hugo.toml` 设 `enableGitInfo = true`，站点是已提交的 Git 仓库。模板：

```go-html-template {file="layouts/_default/single.html"}
<time datetime="{{ .Lastmod.Format "2006-01-02T15:04:05Z07:00" }}">{{ .Lastmod | time.Format ":date_medium" }}</time>
```

`hugo --source <站点目录> --ignoreCache` 构建后：

```html
<time datetime="2026-10-03T02:29:10&#43;08:00">Oct 3, 2026</time>
```

**你应当看到什么**：这里输出的**不是**前置元数据里的 2024-05-06，而是最后一次提交的作者日期——因为 `enableGitInfo = true` 会覆盖 `Lastmod`（见 [`GitInfo`](/methods/page/gitinfo/)）。另外注意 `+` 被转义成 `&#43;`：这是 HTML 属性里对 `+` 的正常转义，浏览器解析后仍是 `+`，时间值本身正确。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，Windows；站点为已提交的 Git 仓库且 `enableGitInfo = true`；`alpha.md` 的 `lastmod` 为 2024-05-06，提交日期为 2026-10-03。

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| 前置元数据写了 `lastmod`，但启用了 `enableGitInfo` | 返回**提交作者日期**（实测 2026-10-03），覆盖前置元数据 | 否 |
| 关闭 `enableGitInfo`（默认） | 按[日期配置](/configuration/front-matter/#dates)的回退链取值（默认 `lastmod` → `date` → `publishDate`） | 否 |
| `time.Format ":date_medium"` | `Oct 3, 2026`（中文站点也未本地化） | 否 |
| 输出到 HTML 属性 | 时区里的 `+` 会被转义为 `&#43;` | 否 |
| 用 `{{ with .Lastmod }}` 判断是否设置 | 恒为真（结构体） | 否 |
| 返回类型 | `time.Time` | 否 |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 最后更新时间与前置元数据不一致 | 写了 `lastmod` 却不生效 | `enableGitInfo = true` 覆盖了它 | 调整[日期配置](/configuration/front-matter/#dates)的优先级，或关闭 Git 集成 |
| 页面显示 `0001-01-01` | 没有任何日期可用 | 回退链全部落空 | 补 `lastmod` / `date`，或配置回退值 |
| CI 上时间不准 | 浅克隆导致取到仓库最近一次提交 | `enableGitInfo` 需要完整克隆 | 按 [`GitInfo`](/methods/page/gitinfo/) 一节的托管注意事项做完整克隆 |
| 时区导致差一天 | 输出的日期与预期差一天 | 时间带原始时区偏移 | 明确写偏移量，或先 `.Lastmod.UTC` |

更多排查入口见[故障排查](/troubleshooting/)。

[`GitInfo`]: /methods/page/gitinfo/
[`time.Format`]: /functions/time/format/
[日期配置]: /configuration/front-matter/#dates
[时间方法]: /methods/time/
[`time.Time`]: https://pkg.go.dev/time#Time
