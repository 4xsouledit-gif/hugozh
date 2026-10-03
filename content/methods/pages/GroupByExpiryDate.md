+++
title = "GroupByExpiryDate"
linkTitle = "GroupByExpiryDate"
description = "返回给定页面集合按过期日期降序分组后的结果。"
date = 2026-10-02
weight = 130
source = "https://gohugo.io/methods/pages/groupbyexpirydate/"

[params.functions_and_methods]
signatures = ["PAGES.GroupByExpiryDate LAYOUT [SORT]"]
returnType = "page.PagesGroup"
+++

## 这一页解决什么问题

把页面按**过期日期（`expiryDate`）分组**：用于「即将下线的内容」「限时活动档期」这类按到期时间分块的列表。组名（`.Key`）由布局字符串决定，例如 `"2006"` 得到按年分组。

返回 `page.PagesGroup`：每组有 `.Key`（`string`）与 `.Pages`。默认**降序**（最晚过期的在前），传 `"asc"` 改为升序。

**关键差异**：`expiryDate` 没有回落链。页面没写它，`.ExpiryDate` 就是零值 `0001-01-01`，会形成一组 `0001`（实测）。这与 [`GroupByLastmod`](/methods/pages/groupbylastmod/) / [`GroupByPublishDate`](/methods/pages/groupbypublishdate/) 不同——它们会回落到 `date`。

## 什么时候用，什么时候别用

**该用**：

- 内容有明确下架时间，需要按到期档期分块；
- 想按年/月统计「什么时候会集中失效」。

**别用**：

- 只想按过期时间**排序** → 用 [`ByExpiryDate`](/methods/pages/byexpirydate/)；
- 按写作/修改/发布时间分组 → 用 [`GroupByDate`](/methods/pages/groupbydate/) / [`GroupByLastmod`](/methods/pages/groupbylastmod/) / [`GroupByPublishDate`](/methods/pages/groupbypublishdate/)；
- 想**过滤掉**已过期页面 → 用 [`collections.Where`](/functions/collections/where/)，分组不过滤。

## 用法

按过期日期分组时，取值由[项目配置][]决定，默认使用前置元数据中的 `expiryDate` 字段。

[布局字符串](#布局字符串)的格式与 [`time.Format`][] 函数的布局字符串相同。得到的分组键会按语言和地区[localized](g)（本地化）。

可选的排序顺序用 `asc` 指定升序，或用 `desc` 指定降序。

要按年和月对内容分组：

```go-html-template
{{ range .Pages.GroupByExpiryDate "January 2006" }}
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
{{ range .Pages.GroupByExpiryDate "January 2006" "asc" }}
  <p>{{ .Key }}</p>
  <ul>
    {{ range .Pages }}
      <li><a href="{{ .RelPermalink }}">{{ .LinkTitle }}</a></li>
    {{ end }}
  </ul>
{{ end }}
```

各组内的页面也会按过期日期排序，升序还是降序取决于分组选项。要对各组内的页面排序，请使用某个排序方法。例如按标题对各组内的页面排序：

```go-html-template
{{ range .Pages.GroupByExpiryDate "January 2006" }}
  <p>{{ .Key }}</p>
  <ul>
    {{ range .Pages.ByTitle }}
      <li><a href="{{ .RelPermalink }}">{{ .Title }}</a></li>
    {{ end }}
  </ul>
{{ end }}
```

## 完整示例：按到期年份分组

示例沿用本章首页的[示例站点结构](/methods/pages/)：

| 页面 | `linkTitle` | `expiryDate` |
| --- | --- | --- |
| `post-1.md` | `alpha` | 2027-01-01 |
| `post-2.md` | `bravo` | 2027-03-01 |
| `post-3.md` | `charlie` | 2028-02-01 |
| `post-4.md` | `delta` | 2028-01-01 |

```go-html-template {file="layouts/_default/list.html"}
按到期年：{{ range .Pages.GroupByExpiryDate "2006" }}{{ .Key }}:{{ range .Pages }}{{ .LinkTitle }} {{ end }}|{{ end }}
升序：{{ range .Pages.GroupByExpiryDate "2006" "asc" }}{{ .Key }}:{{ range .Pages }}{{ .LinkTitle }} {{ end }}|{{ end }}
```

Hugo 渲染为：

```html
按到期年：2028:charlie delta |2027:bravo alpha |
升序：2027:alpha bravo |2028:delta charlie |
```

**你应当看到什么**：默认**降序**，所以 `2028` 组在前，且组内也是降序（`charlie` 2028-02 在 `delta` 2028-01 之前）；传 `"asc"` 后**组顺序与组内顺序一起变成升序**（`2027:alpha bravo`、`2028:delta charlie`）——不是简单地把组倒过来。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，单语言站点（`locale = 'en-US'`、`timeZone = 'UTC'`），Windows。

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| 四页都有 `expiryDate` | 默认降序：`2028:charlie delta`、`2027:bravo alpha` | 否 |
| 传 `"asc"` | 组顺序与**组内顺序**都变成升序（`2027:alpha bravo`、`2028:delta charlie`） | 否 |
| 页面没有 `expiryDate` | `.ExpiryDate` 为零值，归入 **`0001` 组**（实测：`0001` 组出现在末尾，成员是那些没写 `expiryDate` 的页面） | 否 |
| 页面另有 `date`、但没有 `expiryDate` | 不会回落到 `date`，仍然进 `0001` 组 | 否 |
| 布局字符串为 `""` | 所有页面归入一个空组名的组 | 否 |
| 空集合 | 空分组切片；`range` 无输出 | 否 |
| 返回类型 | `page.PagesGroup`（`.Key` 为 `string`，`.Pages` 为 `page.Pages`） | 否 |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 没报错但结果不对 | 多出一个 `0001` 组 | 页面没写 `expiryDate`（该字段不回落） | 补 `expiryDate`，或在模板里跳过 `.Key` 为 `0001` 的组 |
| 没报错但结果不对 | 分组顺序反了 | 默认降序，容易与 [`GroupBy`](/methods/pages/groupby/) 的默认升序记混 | 显式写 `"asc"` / `"desc"` |
| 没报错但结果不对 | 首页列表里少了页面 | 该页 `expiryDate` 已过，默认不参与构建 | `hugo list expired` 确认；预览时加 `--buildExpired` |
| 没报错但结果不对 | 组内顺序不是自己想要的 | 组内顺序由分组选项决定 | 在 `.Pages` 上再排序：`range .Pages.ByTitle` |

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
