+++
title = "ByExpiryDate"
linkTitle = "ByExpiryDate"
description = "返回给定页面集合按过期日期升序排序后的结果。"
date = 2026-10-02
weight = 20
source = "https://gohugo.io/methods/pages/byexpirydate/"

[params.functions_and_methods]
signatures = ["PAGES.ByExpiryDate"]
returnType = "page.Pages"
+++

## 这一页解决什么问题

把页面集合按**过期日期（`expiryDate`）升序**重排：最早过期的在前。用来做「即将下线的活动」「限时内容」这类列表。

排序取值由[项目配置][]决定，默认取前置元数据里的 `expiryDate`。与 `date`/`lastmod`/`publishDate` 不同，**`expiryDate` 没有回落**：页面没写它，`.ExpiryDate` 就是零值 `0001-01-01`，会排在**最前面**（实测）。

## 什么时候用，什么时候别用

**该用**：

- 列出有时效的内容，并让快到期的排前面；
- 配合 `where` 筛出「尚未过期」的内容（见下面的完整示例）。

**别用**：

- 想按发布日期/最后修改排序 → 用 [`ByPublishDate`](/methods/pages/bypublishdate/) / [`ByLastmod`](/methods/pages/bylastmod/)；
- 想要「按过期月份分组」→ 用 [`GroupByExpiryDate`](/methods/pages/groupbyexpirydate/)；
- 想**排除**已过期的页面 → 排序不能排除，先用 [`collections.Where`](/functions/collections/where/) 过滤。

## 用法

按过期日期排序时，取值由[项目配置][]决定，默认使用前置元数据中的 `expiryDate` 字段。

```go-html-template
{{ range .Pages.ByExpiryDate }}
  <h2><a href="{{ .RelPermalink }}">{{ .LinkTitle }}</a></h2>
{{ end }}
```

要改为降序排列：

```go-html-template
{{ range .Pages.ByExpiryDate.Reverse }}
  <h2><a href="{{ .RelPermalink }}">{{ .LinkTitle }}</a></h2>
{{ end }}
```

## 完整示例：升序列表 + 只看未过期

示例沿用本章首页的[示例站点结构](/methods/pages/)（四页都有 `expiryDate`）：

| 页面 | `linkTitle` | `expiryDate` |
| --- | --- | --- |
| `post-1.md` | `alpha` | 2027-01-01 |
| `post-2.md` | `bravo` | 2027-03-01 |
| `post-3.md` | `charlie` | 2028-02-01 |
| `post-4.md` | `delta` | 2028-01-01 |

```go-html-template {file="layouts/_default/list.html"}
按过期升序：{{ range .Pages.ByExpiryDate }}{{ .LinkTitle }}={{ .ExpiryDate.Format "2006-01-02" }} {{ end }}
尚未过期：{{ range where .Pages "ExpiryDate" "gt" now }}{{ .LinkTitle }} {{ end }}
```

Hugo 渲染为（构建日期为 2026-10-03）：

```html
按过期升序：alpha=2027-01-01 bravo=2027-03-01 delta=2028-01-01 charlie=2028-02-01 
尚未过期：alpha bravo charlie delta 
```

**你应当看到什么**：升序按 `expiryDate` 从早到晚（`alpha` 2027-01 → `bravo` 2027-03 → `delta` 2028-01 → `charlie` 2028-02）；`where ... "ExpiryDate" "gt" now` 筛掉的是**构建时已过期**的页面，并且**保持 `.Pages` 的原顺序**（`alpha bravo charlie delta`），不会顺带排序。这一行依赖构建时刻：2028-02 之后 `charlie` 会自己从名单里消失。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，单语言站点（`locale = 'en-US'`、`timeZone = 'UTC'`），Windows。

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| 四页都有 `expiryDate` | 按 `expiryDate` 升序 | 否 |
| 页面没有 `expiryDate` | `.ExpiryDate` 为零值 `0001-01-01`，**排在最前**（不会回落到 `date`） | 否 |
| 页面另有 `date`、但没有 `expiryDate` | 仍然按零值排序，落在 `0001` 一组 | 否 |
| 两个页面过期日期相同 | 组内顺序由内部实现决定，**上游未说明** | 否 |
| 空集合 | 空集合：`range` 无输出，`len` 为 0 | 否 |
| 页面的 `expiryDate` 早于构建日期 | 该页在默认构建中**不参与渲染**（不会出现在任何集合里），需要 `--buildExpired` 才包含 | 否 |
| 返回类型 | `page.Pages` | 否 |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 没报错但结果不对 | 一批页面排在最前，日期显示 `0001-01-01` | 这些页面没写 `expiryDate`（该字段不回落） | 补 `expiryDate`，或在模板里跳过零值 |
| 没报错但结果不对 | 明明写了页面却完全不出现 | 页面的 `expiryDate` 已过，Hugo 默认不构建过期页面 | 检查 `hugo list expired`；确需构建时加 `--buildExpired` |
| 没报错但结果不对 | 列表里出现已经过期的内容 | 排序不做过滤 | 用 `where ... "ExpiryDate" "gt" now` 过滤（见完整示例） |
| 没报错但结果不对 | 降序列表把「无过期日期」的页面排到了最后 | 零值在升序里最前，反转后就在最后 | 先剔除零值再排序更直观 |

更多排查入口见[故障排查](/troubleshooting/)。

[项目配置]: /configuration/front-matter/#dates
