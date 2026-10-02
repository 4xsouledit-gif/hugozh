+++
title = "ByPublishDate"
linkTitle = "ByPublishDate"
description = "返回给定页面集合按发布日期升序排序后的结果。"
date = 2026-10-02
weight = 80
source = "https://gohugo.io/methods/pages/bypublishdate/"

[params.functions_and_methods]
signatures = ["PAGES.ByPublishDate"]
returnType = "page.Pages"
+++

## 这一页解决什么问题

把页面集合按**发布日期（`publishDate`）升序**重排：用于「计划发布」列表、按预告时间编排的内容。

排序取值由[项目配置][]决定，默认取前置元数据里的 `publishDate`。**它没有 `publishDate` 时会沿回落链取 `date`**（实测），所以在只写 `date` 的站点里，它和 [`ByDate`](/methods/pages/bydate/) 结果相同。

> [!TIP]
> `publishDate` 还有一个「硬」作用：**发布日在未来的页面默认不参与构建**，要用 `--buildFuture` 才会出现。列表里少了页面时，先查 `hugo list future`。

## 什么时候用，什么时候别用

**该用**：

- 内容有「预告/正式发布」两个时间，列表要按发布时间排；
- 与 `--buildFuture` 配合做提前排期。

**别用**：

- 只关心写作时间 → 用 [`ByDate`](/methods/pages/bydate/)；
- 关心「最后更新」→ 用 [`ByLastmod`](/methods/pages/bylastmod/)；
- 想按发布月份**分组** → 用 [`GroupByPublishDate`](/methods/pages/groupbypublishdate/)。

## 用法

按发布日期排序时，取值由[项目配置][]决定，默认使用前置元数据中的 `publishDate` 字段。

```go-html-template
{{ range .Pages.ByPublishDate }}
  <h2><a href="{{ .RelPermalink }}">{{ .LinkTitle }}</a></h2>
{{ end }}
```

要改为降序排列：

```go-html-template
{{ range .Pages.ByPublishDate.Reverse }}
  <h2><a href="{{ .RelPermalink }}">{{ .LinkTitle }}</a></h2>
{{ end }}
```

## 完整示例：按预告时间列出尚未发布的内容

示例沿用本章首页的[示例站点结构](/methods/pages/)：

| 页面 | `linkTitle` | `publishDate` | `date` |
| --- | --- | --- | --- |
| `post-1.md` | `alpha` | 2023-01-05 | 2023-01-10 |
| `post-2.md` | `bravo` | 2023-02-10 | 2023-02-15 |
| `post-3.md` | `charlie` | 2022-11-25 | 2022-12-01 |
| `post-4.md` | `delta` | 2024-01-02 | 2024-01-01 |

```go-html-template {file="layouts/_default/list.html"}
按发布升序：{{ range .Pages.ByPublishDate }}{{ .LinkTitle }}={{ .PublishDate.Format "2006-01-02" }} {{ end }}
按写作升序：{{ range .Pages.ByDate }}{{ .LinkTitle }}={{ .Date.Format "2006-01-02" }} {{ end }}
```

Hugo 渲染为：

```html
按发布升序：charlie=2022-11-25 alpha=2023-01-05 bravo=2023-02-10 delta=2024-01-02 
按写作升序：charlie=2022-12-01 alpha=2023-01-10 bravo=2023-02-15 delta=2024-01-01 
```

**你应当看到什么**：两个列表的**顺序相同**，但日期值不同——`post-1` 的 `date` 是 01-10，`publishDate` 是 01-05。示例里四个页面的先后关系恰好一致；只要有一页的 `publishDate` 与 `date` 跨越了别的页面，两个列表的顺序就会分叉。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，单语言站点（`locale = 'en-US'`、`timeZone = 'UTC'`），Windows；未传 `--buildFuture`。

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| 四页都有 `publishDate` | 按 `publishDate` 升序（见上） | 否 |
| 页面只有 `date` | `.PublishDate` 回落到该 `date`（实测） | 否 |
| 页面只有 `lastmod` | `.PublishDate` 等于该 `lastmod`（实测） | 否 |
| 四个日期字段都没有 | `.PublishDate` 为零值 `0001-01-01`，排最前 | 否 |
| `publishDate` 在构建日期之后 | 该页**不参与默认构建**，不会出现在集合里；加 `--buildFuture` 才包含 | 否 |
| 两个页面 `publishDate` 相同 | 顺序由内部实现决定，**上游未说明** | 否 |
| 空集合 | 空集合：`range` 无输出 | 否 |
| 返回类型 | `page.Pages` | 否 |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 没报错但结果不对 | 排好的新内容在列表里找不到 | `publishDate` 在未来，默认不构建 | `hugo list future` 确认；需要预览时加 `--buildFuture` |
| 没报错但结果不对 | 顺序和 `ByDate` 完全一样 | 页面没写 `publishDate`，全体回落到 `date` | 补 `publishDate`，或改用 `ByDate` |
| 没报错但结果不对 | 某页永远第一 | `.PublishDate` 是零值 `0001-01-01` | 补日期字段，或模板里跳过零值 |
| 报错看不懂 | `can't evaluate field ByPublishDate in type ...` | 对象不是页面集合 | 先取集合（`.Pages`、`.RegularPages`） |

更多排查入口见[故障排查](/troubleshooting/)。

[项目配置]: /configuration/front-matter/#dates
