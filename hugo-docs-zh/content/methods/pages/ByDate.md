+++
title = "ByDate"
linkTitle = "ByDate"
description = "返回给定页面集合按日期升序排序后的结果。"
date = 2026-10-02
weight = 10
source = "https://gohugo.io/methods/pages/bydate/"

[params.functions_and_methods]
signatures = ["PAGES.ByDate"]
returnType = "page.Pages"
+++

## 这一页解决什么问题

把页面集合按**日期升序**（旧的在前）重排：文章列表、时间线、归档页都靠它。返回的是**新的集合**，原集合不变，所以可以随手接 `Reverse`、`Limit`。

排序用的值由[项目配置][]决定，默认取前置元数据里的 `date`。**`date` 缺失时会依次回落到 `publishDate`、`lastmod`**（实测，详见下面的边界表）——这就是为什么只有 `lastmod` 的页面也会出现在「按日期」列表里的正确位置。

## 什么时候用，什么时候别用

**该用**：

- 列出文章、新闻、变更记录（要「先发布的在前」）；
- 需要一个稳定的排序基准，再接 [`Reverse`](/methods/pages/reverse/)、[`Limit`](/methods/pages/limit/) 或 [`GroupByDate`](/methods/pages/groupbydate/)。

**别用**：

- 要降序 → 直接 `.ByDate.Reverse`，没有 `ByDateDesc` 这个方法；
- 想按**最后修改**排序 → 用 [`ByLastmod`](/methods/pages/bylastmod/)；
- 想按**发布**时间（`publishDate`）排序 → 用 [`ByPublishDate`](/methods/pages/bypublishdate/)；
- 想按月份/年份**分组** → 用 [`GroupByDate`](/methods/pages/groupbydate/)；
- 想先筛掉一部分页面 → 先用 [`collections.Where`](/functions/collections/where/)，再排序。

## 用法

按日期排序时，取值由[项目配置][]决定，默认使用前置元数据中的 `date` 字段。

```go-html-template
{{ range .Pages.ByDate }}
  <h2><a href="{{ .RelPermalink }}">{{ .LinkTitle }}</a></h2>
{{ end }}
```

要改为降序排列：

```go-html-template
{{ range .Pages.ByDate.Reverse }}
  <h2><a href="{{ .RelPermalink }}">{{ .LinkTitle }}</a></h2>
{{ end }}
```

## 完整示例：同一条集合的升序与降序

示例沿用本章首页的[示例站点结构](/methods/pages/)（`posts` section，四页）：

| 页面 | `linkTitle` | `date` |
| --- | --- | --- |
| `post-1.md` | `alpha` | 2023-01-10 |
| `post-2.md` | `bravo` | 2023-02-15 |
| `post-3.md` | `charlie` | 2022-12-01 |
| `post-4.md` | `delta` | 2024-01-01 |

模板（放在 section 列表模板里，`.Pages` 就是该 section 的页面集合）：

```go-html-template {file="layouts/_default/list.html"}
升序：{{ range .Pages.ByDate }}{{ .LinkTitle }}={{ .Date.Format "2006-01-02" }} {{ end }}
降序：{{ range .Pages.ByDate.Reverse }}{{ .LinkTitle }} {{ end }}
```

Hugo 渲染为：

```html
升序：charlie=2022-12-01 alpha=2023-01-10 bravo=2023-02-15 delta=2024-01-01 
降序：delta bravo alpha charlie 
```

**你应当看到什么**：升序是 `charlie`（2022-12）→ `alpha` → `bravo` → `delta`（2024-01）；`Reverse` 只是把同一个结果倒过来，**不会重新排序**（所以不是按日期降序的另一种算法，就是简单反转）。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，单语言站点（`locale = 'en-US'`、`timeZone = 'UTC'`），Windows。

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| 四页都有 `date` | 按 `date` 升序 | 否 |
| 页面没有 `date`，只有 `lastmod` | 用 `lastmod` 当日期（该页 `.Date` 实测等于 `lastmod`） | 否 |
| 页面没有 `date` 也没有 `lastmod`，只有 `publishDate` | 用 `publishDate` 当日期 | 否 |
| 页面四个日期字段都没有 | `.Date` 为零值 `0001-01-01`，**排在最前** | 否 |
| 两个页面日期相同 | 顺序由内部实现决定，**上游未说明** | 否 |
| 空集合（无子页面的 section） | 空集合：`range` 无输出，`len` 为 0，在 `if` 里判为假 | 否 |
| 返回类型 | `page.Pages`（新集合，可继续接 `Reverse`/`Limit`） | 否 |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 没报错但结果不对 | 某页总是排在最前，日期显示 `0001-01-01` | 该页没有 `date`（也没有 `lastmod`/`publishDate`） | 给页面补 `date`，或在模板里跳过零值：`{{ if not .Date.IsZero }}` |
| 没报错但结果不对 | 降序写成了升序 | `Reverse` 漏写，或写在了取子集之后 | 排序方法与调用顺序有关：先排序再取前几条，与先取前几条再排序，结果不同 |
| 没报错但结果不对 | 「按修改时间」的列表看起来和 `ByDate` 一样 | 页面没写 `lastmod`，`ByLastmod` 回落到 `date` | 补 `lastmod`，或改用 `ByDate` 明示口径 |
| 报错看不懂 | `can't evaluate field ByDate in type ...` | 对象不是页面集合（例如单个页面 `.`） | 先取集合：`.Pages`、`.RegularPages` 或 [`site.RegularPages`](/methods/site/regularpages/) |

更多排查入口见[故障排查](/troubleshooting/)。

[项目配置]: /configuration/front-matter/#dates
