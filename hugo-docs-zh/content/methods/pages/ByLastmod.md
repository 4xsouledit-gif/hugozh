+++
title = "ByLastmod"
linkTitle = "ByLastmod"
description = "返回给定页面集合按最后修改日期升序排序后的结果。"
date = 2026-10-02
weight = 40
source = "https://gohugo.io/methods/pages/bylastmod/"

[params.functions_and_methods]
signatures = ["PAGES.ByLastmod"]
returnType = "page.Pages"
+++

## 这一页解决什么问题

把页面集合按**最后修改日期（`lastmod`）升序**重排：改动最久的在前。用于「最近更新」列表（配 `Reverse`）、内容维护清单。

排序取值由[项目配置][]决定，默认取前置元数据里的 `lastmod`。**`lastmod` 缺失时不会留空**：它会沿回落链取值，实测在没有 `lastmod` 的页面上 `.Lastmod` 等于 `date`（而 `date` 又可能来自 `publishDate`）。所以在只写 `date` 的站点里，`ByLastmod` 与 [`ByDate`](/methods/pages/bydate/) 的结果**完全一样**——这不是 bug，是回落。

## 什么时候用，什么时候别用

**该用**：

- 「最近更新」列表：`.ByLastmod.Reverse`；
- 内容维护/陈旧内容排查。

**别用**：

- 站点里没人维护 `lastmod` → 它会全部回落到 `date`，不如直接用 [`ByDate`](/methods/pages/bydate/) 把口径写明白；
- 想按发布/过期日期 → 用 [`ByPublishDate`](/methods/pages/bypublishdate/) / [`ByExpiryDate`](/methods/pages/byexpirydate/)；
- 想按更新月份分组 → 用 [`GroupByLastmod`](/methods/pages/groupbylastmod/)。

## 用法

按最后修改日期排序时，取值由[项目配置][]决定，默认使用前置元数据中的 `lastmod` 字段。

```go-html-template
{{ range .Pages.ByLastmod }}
  <h2><a href="{{ .RelPermalink }}">{{ .LinkTitle }}</a></h2>
{{ end }}
```

要改为降序排列：

```go-html-template
{{ range .Pages.ByLastmod.Reverse }}
  <h2><a href="{{ .RelPermalink }}">{{ .LinkTitle }}</a></h2>
{{ end }}
```

## 完整示例：四页的 lastmod 各不相同

示例沿用本章首页的[示例站点结构](/methods/pages/)：

| 页面 | `linkTitle` | `lastmod` |
| --- | --- | --- |
| `post-1.md` | `alpha` | 2024-03-01 |
| `post-2.md` | `bravo` | 2024-01-15 |
| `post-3.md` | `charlie` | 2024-02-20 |
| `post-4.md` | `delta` | 2024-04-01 |

```go-html-template {file="layouts/_default/list.html"}
升序：{{ range .Pages.ByLastmod }}{{ .LinkTitle }}={{ .Lastmod.Format "2006-01-02" }} {{ end }}
最近更新：{{ range .Pages.ByLastmod.Reverse | first 2 }}{{ .LinkTitle }} {{ end }}
```

Hugo 渲染为：

```html
升序：bravo=2024-01-15 charlie=2024-02-20 alpha=2024-03-01 delta=2024-04-01 
最近更新：delta alpha 
```

**你应当看到什么**：升序是 `bravo`（1 月）→ `charlie` → `alpha` → `delta`（4 月）；`Reverse` 之后取前两条就是「最近更新」的 `delta`、`alpha`。注意**先 `Reverse` 再 `first 2`**：如果写反成 `first 2` 之后 `Reverse`，拿到的是最旧的两条。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，单语言站点（`locale = 'en-US'`、`timeZone = 'UTC'`），Windows，未开启 `enableGitInfo`。

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| 四页都有 `lastmod` | 按 `lastmod` 升序（见上） | 否 |
| 页面只有 `date`（无 `lastmod`） | `.Lastmod` 等于该 `date`（实测） | 否 |
| 页面只有 `publishDate` | `.Lastmod` 等于该 `publishDate`（实测） | 否 |
| 四个日期字段都没有 | `.Lastmod` 为零值 `0001-01-01`，排最前 | 否 |
| 两个页面 `lastmod` 相同 | 顺序由内部实现决定，**上游未说明** | 否 |
| 空集合 | 空集合：`range` 无输出，`len` 为 0 | 否 |
| 返回类型 | `page.Pages` | 否 |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 没报错但结果不对 | 结果和 `ByDate` 一模一样 | 页面都没写 `lastmod`，全体回落到 `date` | 补 `lastmod`；或直接改用 `ByDate` |
| 没报错但结果不对 | 「最近更新」列表顺序反了 | `Reverse` 与 `first N` 的先后写反 | 先 `Reverse` 再 `first N` |
| 没报错但结果不对 | 某页永远是第一条 | `.Lastmod` 是零值 `0001-01-01` | 补日期字段，或在模板里跳过零值 |
| 报错看不懂 | `can't evaluate field ByLastmod in type ...` | 对象不是页面集合 | 先取集合（`.Pages`、`.RegularPages`） |

更多排查入口见[故障排查](/troubleshooting/)。

[项目配置]: /configuration/front-matter/#dates
