+++
title = "GroupByPublishDate"
linkTitle = "GroupByPublishDate"
description = "返回给定页面集合按发布日期降序分组后的结果。"
date = 2026-10-02
weight = 170
source = "https://gohugo.io/methods/pages/groupbypublishdate/"

[params.functions_and_methods]
signatures = ["PAGES.GroupByPublishDate LAYOUT [SORT]"]
returnType = "page.PagesGroup"
+++

## 这一页解决什么问题

把页面按**发布日期（`publishDate`）分组**：用于「排期表」「按发布档期归档」这类列表。组名（`.Key`）由布局字符串决定。

返回 `page.PagesGroup`：每组有 `.Key`（`string`）与 `.Pages`。默认**降序**（最近发布的在前）。

**回落规则**：页面没写 `publishDate` 时会沿回落链取值（实测 `.PublishDate` 等于 `date` 或 `lastmod`），所以不会掉进 `0001` 组。另外 `publishDate` 还决定页面**是否参与构建**：发布日在未来的页面默认不构建，分组里自然也看不到。

## 什么时候用，什么时候别用

**该用**：

- 内容有排期，需要按发布档期分块（常配 `--buildFuture` 做预告页）。

**别用**：

- 只想按发布时间**排序** → 用 [`ByPublishDate`](/methods/pages/bypublishdate/)；
- 按写作/修改/过期日期分组 → 用 [`GroupByDate`](/methods/pages/groupbydate/) / [`GroupByLastmod`](/methods/pages/groupbylastmod/) / [`GroupByExpiryDate`](/methods/pages/groupbyexpirydate/)；
- 只想排除未来内容 → 那是构建参数与 `where` 的事，不是分组。

## 用法

按发布日期分组时，取值由[项目配置][]决定，默认使用前置元数据中的 `publishDate` 字段。

[布局字符串](#布局字符串)的格式与 [`time.Format`][] 函数的布局字符串相同。得到的分组键会按语言和地区[localized](g)（本地化）。

可选的排序顺序用 `asc` 指定升序，或用 `desc` 指定降序。

要按年和月对内容分组：

```go-html-template
{{ range .Pages.GroupByPublishDate "January 2006" }}
  <p>{{ .Key }}</p>
  <ul>
    {{ range .Pages }}
      <li><a href="{{ .RelPermalink }}">{{ .LinkTitle }}</a></li>
    {{ end }}
  </ul>
{{ end }}
```

要把各组改为升序排列：

```go-html-template
{{ range .Pages.GroupByPublishDate "January 2006" "asc" }}
  <p>{{ .Key }}</p>
  <ul>
    {{ range .Pages }}
      <li><a href="{{ .RelPermalink }}">{{ .LinkTitle }}</a></li>
    {{ end }}
  </ul>
{{ end }}
```

各组内的页面也会按发布日期排序，升序还是降序取决于分组选项。要对各组内的页面排序，请使用某个排序方法。例如按标题对各组内的页面排序：

```go-html-template
{{ range .Pages.GroupByPublishDate "January 2006" }}
  <p>{{ .Key }}</p>
  <ul>
    {{ range .Pages.ByTitle }}
      <li><a href="{{ .RelPermalink }}">{{ .Title }}</a></li>
    {{ end }}
  </ul>
{{ end }}
```

## 完整示例：按发布月份分组

示例沿用本章首页的[示例站点结构](/methods/pages/)：

| 页面 | `linkTitle` | `publishDate` |
| --- | --- | --- |
| `post-1.md` | `alpha` | 2023-01-05 |
| `post-2.md` | `bravo` | 2023-02-10 |
| `post-3.md` | `charlie` | 2022-11-25 |
| `post-4.md` | `delta` | 2024-01-02 |

```go-html-template {file="layouts/_default/list.html"}
按发布月：{{ range .Pages.GroupByPublishDate "2006-01" }}{{ .Key }}:{{ range .Pages }}{{ .LinkTitle }} {{ end }}|{{ end }}
升序：{{ range .Pages.GroupByPublishDate "2006-01" "asc" }}{{ .Key }}:{{ range .Pages }}{{ .LinkTitle }} {{ end }}|{{ end }}
```

Hugo 渲染为：

```html
按发布月：2024-01:delta |2023-02:bravo |2023-01:alpha |2022-11:charlie |
升序：2022-11:charlie |2023-01:alpha |2023-02:bravo |2024-01:delta |
```

**你应当看到什么**：默认降序，`2024-01`（`delta`）在最前，四页各占一组；`"asc"` 后从 `2022-11` 开始。注意组名来自 `publishDate`（`post-1` 是 `2023-01`），与 [`GroupByDate`](/methods/pages/groupbydate/) 用 `date` 得到的组名可能落在不同月份。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，单语言站点（`locale = 'en-US'`、`timeZone = 'UTC'`），Windows；未传 `--buildFuture`。

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| 四页都有 `publishDate` | 默认降序 4 组（见上） | 否 |
| 页面只有 `date` | `.PublishDate` 回落到该 `date`，按其归组（实测） | 否 |
| 页面只有 `lastmod` | `.PublishDate` 等于该 `lastmod`（实测） | 否 |
| 四个日期字段都没有 | 归入 `0001` 对应的组 | 否 |
| `publishDate` 在构建日期之后 | 该页**不参与默认构建**，不会出现在任何分组里；`--buildFuture` 才包含 | 否 |
| 布局字符串为 `""` | 所有页面归入一个空组名的组 | 否 |
| 空集合 | 空分组切片；`range` 无输出 | 否 |
| 返回类型 | `page.PagesGroup`（`.Key` 为 `string`，`.Pages` 为 `page.Pages`） | 否 |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 没报错但结果不对 | 排好的新内容在分组里找不到 | `publishDate` 在未来，默认不构建 | `hugo list future` 确认；预览加 `--buildFuture` |
| 没报错但结果不对 | 分组结果和 `GroupByDate` 一样 | 页面没写 `publishDate`，回落到 `date` | 补 `publishDate`，或改用 `GroupByDate` |
| 没报错但结果不对 | 分组顺序反了 | 默认降序 | 显式写 `"asc"` / `"desc"` |
| 报错看不懂 | 分组为空 | 集合为空（无子页面的 section） | 先用 `{{ if .Pages }}` 判断 |

更多排查入口见[故障排查](/troubleshooting/)。

## 布局字符串

基于 [Go 的参考时间][Go's reference time]格式化 `time.Time` 值：

```text
Mon Jan 2 15:04:05 MST 2006
```

使用以下组成部分构造布局字符串：

说明|有效组成部分
:--|:--
年|`"2006" "06"`
月|`"Jan" "January" "01" "1"`
星期|`"Mon" "Monday"`
月内日期|`"2" "_2" "02"`
年内日期|`"__2" "002"`
小时|`"15" "3" "03"`
分钟|`"4" "04"`
秒|`"5" "05"`
AM/PM 标记|`"PM"`
时区偏移|`"-0700" "-07:00" "-07" "-070000" "-07:00:00"`

把布局字符串中的符号替换为 Z，UTC 时区就会打印 Z 而不是偏移量。

说明|有效组成部分
:--|:--
时区偏移|`"Z0700" "Z07:00" "Z07" "Z070000" "Z07:00:00"`

```go-html-template
{{ $t := "2023-01-27T23:44:58-08:00" }}
{{ $t = time.AsTime $t }}
{{ $t = $t.Format "Jan 02, 2006 3:04 PM Z07:00" }}

{{ $t }} → Jan 27, 2023 11:44 PM -08:00
```

`PST`、`CET` 这样的字符串不是时区，而是时区*缩写*。

`-07:00`、`+01:00` 这样的字符串不是时区，而是时区*偏移量*。

时区是本地时间相同的一个地理区域。例如，被 `PST` 与 `PDT`（取决于夏令时）缩写的时区是 `America/Los_Angeles`。

[Go's reference time]: https://pkg.go.dev/time#pkg-constants
[`time.Format`]: /functions/time/format/
[项目配置]: /configuration/front-matter/#dates
