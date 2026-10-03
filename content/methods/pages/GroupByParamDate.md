+++
title = "GroupByParamDate"
linkTitle = "GroupByParamDate"
description = "返回给定页面集合按指定日期参数降序分组后的结果。"
date = 2026-10-02
weight = 160
source = "https://gohugo.io/methods/pages/groupbyparamdate/"

[params.functions_and_methods]
signatures = ["PAGES.GroupByParamDate PARAM LAYOUT [SORT]"]
returnType = "page.PagesGroup"
+++

## 这一页解决什么问题

按**自定义的日期参数**分组：活动日期（`eventDate`）、截止日期、课表日期……内置的四个日期字段归 [`GroupByDate`](/methods/pages/groupbydate/) 那一家管，自定义日期用这一页。

它有两个参数：`PARAM`（字段名）与 `LAYOUT`（布局字符串，决定组名的粒度，例如 `"2006-01"`、`"January 2006"`）。返回 `page.PagesGroup`，默认**降序**。

与 [`GroupByParam`](/methods/pages/groupbyparam/) 不同：**缺该参数的页面不会被丢掉**，而是归入 `0001` 对应的组（实测），因为取不到日期时就当成零值时间。

## 什么时候用，什么时候别用

**该用**：

- 分组依据是自定义日期字段，且需要按月/按年成块；
- 页面写的是 TOML 未加引号的日期（`eventDate = 2024-05-01`）。**YAML/JSON 或加了引号的 TOML 日期是字符串**，无法当时间解析，会统统落进 `0001` 组。

**别用**：

- 内置日期字段 → 用 [`GroupByDate`](/methods/pages/groupbydate/)、[`GroupByLastmod`](/methods/pages/groupbylastmod/)、[`GroupByPublishDate`](/methods/pages/groupbypublishdate/)、[`GroupByExpiryDate`](/methods/pages/groupbyexpirydate/)；
- 非日期参数 → 用 [`GroupByParam`](/methods/pages/groupbyparam/)；
- 只想排序 → 用 [`ByParam`](/methods/pages/byparam/)（自定义日期排序的写法见[相关内容](/content-management/related-content/)一节的日期比较说明）。

## 用法

[布局字符串](#布局字符串)的格式与 [`time.Format`][] 函数的布局字符串相同。得到的分组键会按语言和地区[localized](g)（本地化）。

可选的排序顺序用 `asc` 指定升序，或用 `desc` 指定降序。

要按年和月对内容分组：

```go-html-template
{{ range .Pages.GroupByParamDate "eventDate" "January 2006" }}
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
{{ range .Pages.GroupByParamDate "eventDate" "January 2006" "asc" }}
  <p>{{ .Key }}</p>
  <ul>
    {{ range .Pages }}
      <li><a href="{{ .RelPermalink }}">{{ .LinkTitle }}</a></li>
    {{ end }}
  </ul>
{{ end }}
```

各组内的页面也会按该参数的日期排序，升序还是降序取决于分组选项。要对各组内的页面排序，请使用某个排序方法。例如按标题对各组内的页面排序：

```go-html-template
{{ range .Pages.GroupByParamDate "eventDate" "January 2006" }}
  <p>{{ .Key }}</p>
  <ul>
    {{ range .Pages.ByTitle }}
      <li><a href="{{ .RelPermalink }}">{{ .Title }}</a></li>
    {{ end }}
  </ul>
{{ end }}
```

## 完整示例：按自定义的 eventDate 分月

示例沿用本章首页的[示例站点结构](/methods/pages/)：

| 页面 | `linkTitle` | `eventDate` |
| --- | --- | --- |
| `post-1.md` | `alpha` | 2024-05-01 |
| `post-2.md` | `bravo` | 2024-06-01 |
| `post-3.md` | `charlie` | 2024-05-15 |
| `post-4.md` | `delta` | 2024-07-01 |

```go-html-template {file="layouts/_default/list.html"}
默认（降序）：{{ range .Pages.GroupByParamDate "eventDate" "2006-01" }}{{ .Key }}:{{ range .Pages }}{{ .LinkTitle }} {{ end }}|{{ end }}
升序：{{ range .Pages.GroupByParamDate "eventDate" "2006-01" "asc" }}{{ .Key }}:{{ range .Pages }}{{ .LinkTitle }} {{ end }}|{{ end }}
```

Hugo 渲染为：

```html
默认（降序）：2024-07:delta |2024-06:bravo |2024-05:charlie alpha |
升序：2024-05:alpha charlie |2024-06:bravo |2024-07:delta |
```

**你应当看到什么**：默认降序（`2024-07` 在前），`2024-05` 组里有 `charlie`（05-15）与 `alpha`（05-01）两页，顺序同样是降序；传 `"asc"` 后组顺序与组内顺序一起变成升序。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，单语言站点（`locale = 'en-US'`、`timeZone = 'UTC'`），Windows。

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| 四页都有 `eventDate`（TOML 未加引号的日期） | 3 组，默认降序（见上） | 否 |
| 传 `"asc"` | 组顺序与组内顺序都变成升序 | 否 |
| 页面缺该参数 | **不丢弃**：归入 `0001` 对应的组（实测该组包含全部缺参数的页面） | 否 |
| 所有页面都缺该参数 | 仍然得到 1 组，组名来自零值时间的布局结果（`"2006"` → `0001`） | 否 |
| 参数是日期**字符串**（YAML/JSON，或加了引号的 TOML） | 无法解析成时间，全部落进 `0001` 组 | 否 |
| 参数是纯字符串（如 `color`） | 不报错，全部落进 `0001` 组 | 否 |
| 组名 | `string`，按站点 locale 本地化 | 否 |
| 空集合 | 空分组切片；`range` 无输出 | 否 |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 没报错但结果不对 | 所有页面挤在一组，组名是 `0001` | 该日期字段是字符串（YAML/JSON，或 TOML 加了引号） | 用 TOML 且不给日期加引号；否则改用 [`ByParam`](/methods/pages/byparam/) 手工筛 |
| 没报错但结果不对 | 缺参数的页面出现在 `0001` 组 | 该方法保留缺参数的页面 | 补参数，或在模板里跳过该组 |
| 没报错但结果不对 | 分组顺序反了 | 默认降序 | 显式写 `"asc"` / `"desc"` |
| 没报错但结果不对 | 组名格式和预期不符 | 组名由 `LAYOUT` 决定并本地化 | 需要固定格式时用 `"2006-01"` 这类数字布局 |

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
