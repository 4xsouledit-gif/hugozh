+++
title = "GroupByLastmod"
linkTitle = "GroupByLastmod"
description = "返回给定页面集合按最后修改日期降序分组后的结果。"
date = 2026-10-02
weight = 140
source = "https://gohugo.io/methods/pages/groupbylastmod/"

[params.functions_and_methods]
signatures = ["PAGES.GroupByLastmod LAYOUT [SORT]"]
returnType = "page.PagesGroup"
+++

## 这一页解决什么问题

把页面按**最后修改日期（`lastmod`）分组**：用于「更新日志按月归档」「最近改动分块」这类列表。组名（`.Key`）由布局字符串决定，例如 `"2006-01"` 得到 `2024-04` 这样的组名。

返回 `page.PagesGroup`：每组有 `.Key`（`string`）与 `.Pages`。默认**降序**（最近的改动在前）。

**回落规则**：页面没写 `lastmod` 时，Hugo 会沿回落链取值（实测 `.Lastmod` 会等于 `date`，而 `date` 又可能来自 `publishDate`），所以没写 `lastmod` 的页面**不会掉进 `0001` 组**，而是按 `date` 归组——这让结果看起来「对」，却容易掩盖「其实没有维护 `lastmod`」这个事实。

## 什么时候用，什么时候别用

**该用**：

- 有维护 `lastmod` 的站点，做更新归档或维护审计；
- 想按「最近改动」分块展示。

**别用**：

- 想按修改时间**排序**不分块 → 用 [`ByLastmod`](/methods/pages/bylastmod/)；
- 按写作/发布/过期日期分组 → 用 [`GroupByDate`](/methods/pages/groupbydate/) / [`GroupByPublishDate`](/methods/pages/groupbypublishdate/) / [`GroupByExpiryDate`](/methods/pages/groupbyexpirydate/)；
- 站点没维护 `lastmod` → 分组结果等同于按 `date` 分组，不如直接用 [`GroupByDate`](/methods/pages/groupbydate/) 写明口径。

## 用法

按最后修改日期分组时，取值由[项目配置][]决定，默认使用前置元数据中的 `lastmod` 字段。

[布局字符串](#布局字符串)的格式与 [`time.Format`][] 函数的布局字符串相同。得到的分组键会按语言和地区[localized](g)（本地化）。

可选的排序顺序用 `asc` 指定升序，或用 `desc` 指定降序。

要按年和月对内容分组：

```go-html-template
{{ range .Pages.GroupByLastmod "January 2006" }}
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
{{ range .Pages.GroupByLastmod "January 2006" "asc" }}
  <p>{{ .Key }}</p>
  <ul>
    {{ range .Pages }}
      <li><a href="{{ .RelPermalink }}">{{ .LinkTitle }}</a></li>
    {{ end }}
  </ul>
{{ end }}
```

各组内的页面也会按最后修改日期排序，升序还是降序取决于分组选项。要对各组内的页面排序，请使用某个排序方法。例如按标题对各组内的页面排序：

```go-html-template
{{ range .Pages.GroupByLastmod "January 2006" }}
  <p>{{ .Key }}</p>
  <ul>
    {{ range .Pages.ByTitle }}
      <li><a href="{{ .RelPermalink }}">{{ .Title }}</a></li>
    {{ end }}
  </ul>
{{ end }}
```

## 完整示例：按修改月份分组

示例沿用本章首页的[示例站点结构](/methods/pages/)：

| 页面 | `linkTitle` | `lastmod` |
| --- | --- | --- |
| `post-1.md` | `alpha` | 2024-03-01 |
| `post-2.md` | `bravo` | 2024-01-15 |
| `post-3.md` | `charlie` | 2024-02-20 |
| `post-4.md` | `delta` | 2024-04-01 |

```go-html-template {file="layouts/_default/list.html"}
按修改月：{{ range .Pages.GroupByLastmod "2006-01" }}{{ .Key }}:{{ range .Pages }}{{ .LinkTitle }} {{ end }}|{{ end }}
升序：{{ range .Pages.GroupByLastmod "2006-01" "asc" }}{{ .Key }}:{{ range .Pages }}{{ .LinkTitle }} {{ end }}|{{ end }}
```

Hugo 渲染为：

```html
按修改月：2024-04:delta |2024-03:alpha |2024-02:charlie |2024-01:bravo |
升序：2024-01:bravo |2024-02:charlie |2024-03:alpha |2024-04:delta |
```

**你应当看到什么**：默认降序，`2024-04`（`delta`）在最前；传 `"asc"` 后变成 `2024-01` 开头。因为是「月」布局，四页恰好各占一组。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，单语言站点（`locale = 'en-US'`、`timeZone = 'UTC'`），Windows，未开启 `enableGitInfo`。

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| 四页都有 `lastmod`（2024-01 ~ 2024-04） | 默认降序 4 组（见上） | 否 |
| 页面只有 `date` | `.Lastmod` 等于该 `date`，按 `date` 归组（实测） | 否 |
| 页面只有 `publishDate` | `.Lastmod` 等于该 `publishDate`，按其归组（实测） | 否 |
| 四个日期字段都没有 | 归入 `0001` 对应的组 | 否 |
| 布局字符串为 `""` | 所有页面归入一个空组名的组 | 否 |
| 空集合 | 空分组切片；`range` 无输出 | 否 |
| 返回类型 | `page.PagesGroup`（`.Key` 为 `string`，`.Pages` 为 `page.Pages`） | 否 |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 没报错但结果不对 | 分组结果和 `GroupByDate` 一模一样 | 页面都没写 `lastmod`，全体回落到 `date` | 补 `lastmod`；或改用 `GroupByDate` |
| 没报错但结果不对 | 分组顺序反了 | 默认降序 | 显式写 `"asc"` / `"desc"` |
| 没报错但结果不对 | 出现 `0001` 组 | 该页四个日期字段都缺 | 补日期，或跳过该组 |
| 报错看不懂 | 分组为空 | 集合本身为空 | 先用 `{{ if .Pages }}` 判断 |

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
