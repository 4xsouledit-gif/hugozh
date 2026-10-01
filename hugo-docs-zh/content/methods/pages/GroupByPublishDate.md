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
