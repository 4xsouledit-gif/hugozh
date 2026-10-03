+++
title = "GroupByDate"
linkTitle = "GroupByDate"
description = "返回给定页面集合按日期降序分组后的结果。"
date = 2026-10-02
weight = 120
source = "https://gohugo.io/methods/pages/groupbydate/"

[params.functions_and_methods]
signatures = ["PAGES.GroupByDate LAYOUT [SORT]"]
returnType = "page.PagesGroup"
+++

## 这一页解决什么问题

把页面按**日期分组**，用于时间归档：「2024 年 1 月」「2023 年 2 月」这样的分节列表。分组名（`.Key`）由你给的**布局字符串**决定——同一份内容，布局写 `"2006"` 得到按年归档，写 `"January 2006"` 得到「月份名 + 年份」，写 `"2006-01"` 得到 `2024-01`。

返回 `page.PagesGroup`：每组有 `.Key`（`string`）与 `.Pages`（组内集合，可继续接排序方法）。

与其它 `GroupByXxxDate` 一样，**默认是降序**（新的月份在前），传 `"asc"` 才是升序——这与 [`GroupBy`](/methods/pages/groupby/) 的默认升序相反，容易记混。

## 什么时候用，什么时候别用

**该用**：

- 博客归档页、更新日志、按月份排列的目录；
- 需要「先按月分块，再在块内排序」。

**别用**：

- 只想按日期**排序**不分块 → 用 [`ByDate`](/methods/pages/bydate/)；
- 按最后修改/发布/过期日期分组 → 用 [`GroupByLastmod`](/methods/pages/groupbylastmod/) / [`GroupByPublishDate`](/methods/pages/groupbypublishdate/) / [`GroupByExpiryDate`](/methods/pages/groupbyexpirydate/)；
- 按自定义日期字段分组 → 用 [`GroupByParamDate`](/methods/pages/groupbyparamdate/)；
- 按非日期字段分组 → 用 [`GroupBy`](/methods/pages/groupby/) 或 [`GroupByParam`](/methods/pages/groupbyparam/)。

## 用法

按日期分组时，取值由[项目配置][]决定，默认使用前置元数据中的 `date` 字段。

[布局字符串](#布局字符串)的格式与 [`time.Format`][] 函数的布局字符串相同。得到的分组键会按语言和地区[localized](g)（本地化）。

可选的排序顺序用 `asc` 指定升序，或用 `desc` 指定降序。

要按年和月对内容分组：

```go-html-template
{{ range .Pages.GroupByDate "January 2006" }}
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
{{ range .Pages.GroupByDate "January 2006" "asc" }}
  <p>{{ .Key }}</p>
  <ul>
    {{ range .Pages }}
      <li><a href="{{ .RelPermalink }}">{{ .LinkTitle }}</a></li>
    {{ end }}
  </ul>
{{ end }}
```

各组内的页面也会按日期排序，升序还是降序取决于分组选项。要对各组内的页面排序，请使用某个排序方法。例如按标题对各组内的页面排序：

```go-html-template
{{ range .Pages.GroupByDate "January 2006" }}
  <p>{{ .Key }}</p>
  <ul>
    {{ range .Pages.ByTitle }}
      <li><a href="{{ .RelPermalink }}">{{ .Title }}</a></li>
    {{ end }}
  </ul>
{{ end }}
```

## 完整示例：按月份归档并换布局字符串

示例沿用本章首页的[示例站点结构](/methods/pages/)：

| 页面 | `linkTitle` | `date` |
| --- | --- | --- |
| `post-1.md` | `alpha` | 2023-01-10 |
| `post-2.md` | `bravo` | 2023-02-15 |
| `post-3.md` | `charlie` | 2022-12-01 |
| `post-4.md` | `delta` | 2024-01-01 |

```go-html-template {file="layouts/_default/list.html"}
默认（降序）：{{ range .Pages.GroupByDate "2006-01" }}{{ .Key }}:{{ range .Pages }}{{ .LinkTitle }} {{ end }}|{{ end }}
升序：{{ range .Pages.GroupByDate "2006-01" "asc" }}{{ .Key }}:{{ range .Pages }}{{ .LinkTitle }} {{ end }}|{{ end }}
本地化月份名：{{ range .Pages.GroupByDate "January 2006" }}{{ .Key }}|{{ end }}
```

Hugo 渲染为：

```html
默认（降序）：2024-01:delta |2023-02:bravo |2023-01:alpha |2022-12:charlie |
升序：2022-12:charlie |2023-01:alpha |2023-02:bravo |2024-01:delta |
本地化月份名：January 2024|February 2023|January 2023|December 2022|
```

**你应当看到什么**：不传排序参数时**新的月份在前**（`2024-01` 第一）；传 `"asc"` 反过来；换成 `"January 2006"` 后组名变成「英文月份 + 年份」——**组名是本地化过的文本**，示例站点的 `locale` 是 `en-US`，所以是英文月份名。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，单语言站点（`locale = 'en-US'`、`timeZone = 'UTC'`），Windows。

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| `GroupByDate "2006-01"` | 4 组，默认**降序**（见上） | 否 |
| 传 `"asc"` | 4 组升序 | 否 |
| 传其它字符串（`"up"`） | **不报错**，按默认（降序）处理 | 否 |
| 布局字符串为 `""` | **不报错**：所有页面归入一个 `.Key` 为空字符串的组 | 否 |
| `.Key` 类型 | `string`（本地化后的文本） | 否 |
| 页面没有 `date`（回落链也没有） | `.Date` 为零值，归入 `0001-01-01` 对应的组（分组名取决于布局字符串） | 否 |
| 组内只有一个页面 | `.Pages.Len` 为 1；组内仍可 `range .Pages.ByTitle` | 否 |
| 空集合 | 空分组切片；`range` 无输出，`if` 判为假 | 否 |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 没报错但结果不对 | 归档顺序反了 | 该方法**默认降序**（与 `GroupBy` 相反） | 明确写 `"asc"` 或 `"desc"`，不要靠默认值 |
| 没报错但结果不对 | 组名是英文月份，站点明明是中文 | 组名按**站点 locale** 本地化 | 需要固定格式就用 `"2006-01"` 这类数字布局 |
| 没报错但结果不对 | 多出一组 `0001` | 有页面没有日期，`.Date` 是零值 | 补 `date`，或在模板里跳过该组 |
| 没报错但结果不对 | 组内顺序不是自己想要的 | 组内顺序由分组选项决定 | 在 `.Pages` 上再排序：`range .Pages.ByTitle` |
| 报错看不懂 | 分组结果为空 | 集合本身是空的（例如在无子页面的 section 上调用） | 先用 `{{ if .Pages }}` 判断，或看本章首页的空集合说明 |

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
