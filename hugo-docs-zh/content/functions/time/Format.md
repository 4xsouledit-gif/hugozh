+++
title = "time.Format"
linkTitle = "Format"
description = "把给定日期/时间返回为格式化并本地化后的字符串。"
date = 2026-10-02
weight = 40
source = "https://gohugo.io/functions/time/format/"

[params.functions_and_methods]
signatures = ["time.Format LAYOUT INPUT"]
returnType = "string"
aliases = ["dateFormat"]
+++

## 这一页解决什么问题

页面上几乎不会直接输出 `2023-10-15T13:18:50-07:00` 这种原始时间值，你要的是 `2023-10-15`、`15 Oct 2023` 或本地化后的日期。`time.Format` 做的就是这一步：给它一段布局字符串（`LAYOUT`）和一个时间值（`INPUT`），返回格式化后的字符串。

它同时承担两件事，初学时容易混：

1. **格式化**——布局字符串怎么写，就怎么输出（见本页「布局字符串」一节）；
2. **本地化**——`:date_medium` 这类标记的输出随站点语言与地区变化（见本页「本地化」一节）。

`INPUT` 既可以是 `time.Time` 值，也可以是**能被解析的日期/时间字符串**；后者的解析是隐式发生的，也正是最容易踩坑的地方——解析失败会让构建失败（边界见文末实测表）。

对 `time.Time` 值使用 `time.Format` 函数：

```go-html-template
{{ $t := time.AsTime "2023-10-15T13:18:50-07:00" }}
{{ time.Format "2 Jan 2006" $t }} → 15 Oct 2023
```

也可以对可解析的日期/时间值字符串表示使用 `time.Format`：

```go-html-template
{{ $t := "15 Oct 2023" }}
{{ time.Format "January 2, 2006" $t }} → October 15, 2023
```

可解析的字符串表示示例：

格式|时区
:--|:--
`2023-10-15T13:18:50-07:00`|`America/Los_Angeles`
`2023-10-15T13:18:50-0700`|`America/Los_Angeles`
`2023-10-15T13:18:50Z`|`Etc/UTC`
`2023-10-15T13:18:50`|默认为 `Etc/UTC`
`2023-10-15`|默认为 `Etc/UTC`
`15 Oct 2023`|默认为 `Etc/UTC`

最后三个示例不是完整限定的时间，默认使用 `Etc/UTC` 时区。

要覆盖默认时区，请在项目配置中设置 [`timeZone`][]。确定时区时的优先级顺序为：

1. 日期/时间字符串中的时区偏移
1. 项目配置中指定的时区
1. `Etc/UTC` 时区

## 什么时候用，什么时候别用

**该用**：

- 在模板里输出页面日期（`.Date`、`.Lastmod`、`.PublishDate`）、`now` 或任何 `time.Time` 值；
- 展示给读者的日期需要随站点语言变化 → 用 `:date_*`、`:time_*` 标记；需要固定格式（RSS、`datetime` 属性、文件名）→ 用布局字符串；
- 输入是字符串（front matter 里的自定义日期、`hugo.Data` 里的日期字符串）→ `time.Format` 会先解析再格式化。

**别用**：

- 只想把字符串原样输出 → 不要过 `time.Format`：解析失败时它会直接让**构建失败**（实测见文末）；
- 还需要对时间做别的运算（比较、取年/月、算间隔）→ 先用 [`time.AsTime`](/functions/time/astime/) 转成 `time.Time` 值，`time.Format` 只负责最后一步输出；
- 要用 Hugo 的**本地化标记**（`:date_long`、`:time_full` 等，见下文）→ 必须用 `time.Format`；`time.Time` 的 `.Format` 方法不认这些标记，会把 `:time_full` **原样打印成字符串** `":time_full"`（实测）；
- 要打印时区**缩写**（`MST`、`PST`）→ 见文末实测：能否得到缩写取决于时间值本身带的是**具名时区**还是**数字偏移**，与用函数还是用方法基本无关；
- 需要先把同一时刻换算到别的时区 → 先用 [`time.In`](/functions/time/in/) 再格式化。

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

## 本地化

使用 `time.Format` 函数按当前语言与地区本地化 `time.Time` 值。

> [!NOTE]
> 日期、货币、数字与百分比的本地化由 [`bep/golocales`][] 包完成。Hugo 使用 [`locale`][] 配置项确定地区，未设置时回退到语言键本身。解析出的值必须是该包支持的地区。

[`bep/golocales`]: https://github.com/bep/golocales
[`locale`]: /configuration/all/#locale

可以使用上文所述的布局字符串，也可以使用下面某个标记（token）。例如：

```go-html-template
{{ .Date | time.Format ":date_medium" }} → Jan 27, 2023
```

本地化为 en-US：

标记|结果
:--|:--
`:date_full`|`Friday, January 27, 2023`
`:date_long`|`January 27, 2023`
`:date_medium`|`Jan 27, 2023`
`:date_short`|`1/27/23`
`:time_full`|`11:44:58 pm Pacific Standard Time`
`:time_long`|`11:44:58 pm PST`
`:time_medium`|`11:44:58 pm`
`:time_short`|`11:44 pm`

本地化为 de-DE：

标记|结果
:--|:--
`:date_full`|`Freitag, 27. Januar 2023`
`:date_long`|`27. Januar 2023`
`:date_medium`|`27.01.2023`
`:date_short`|`27.01.23`
`:time_full`|`23:44:58 Nordamerikanische Westküsten-Normalzeit`
`:time_long`|`23:44:58 PST`
`:time_medium`|`23:44:58`
`:time_short`|`23:44`

### 本地化标记的实测行为

上游给出的两张表分别是 `locale = 'en-US'` 与 `locale = 'de-DE'` 站点的输出，**不要当成「本站会看到的结果」**。同样一段代码在不同语言键与地区下的实测结果（Hugo 0.167.0，单语言站点，输入为 `time.AsTime "2023-01-27T23:44:58-08:00"`）：

| 配置 | `:date_long` | `:time_medium` |
| --- | --- | --- |
| `locale = 'zh-CN'` 加 `defaultContentLanguage = 'zh'` | `2023年1月27日` | `23:44:58` |
| `locale = 'zh-CN'` 加 `defaultContentLanguage = 'zh-cn'` | `January 27, 2023` | `11:44:58 pm` |
| `locale = 'zh-Hans'` 加 `defaultContentLanguage = 'zh-cn'` | `2023年1月27日` | —— |
| `locale = 'de-DE'` 加 `defaultContentLanguage = 'zh-cn'` | `27. Januar 2023` | —— |

结论：`locale` 一般是生效的（`de-DE` 正常输出德语），但 **`locale = 'zh-CN'` 与语言键 `zh-cn` 这个组合会回退成英文**；把语言键写成 `zh`，或把 `locale` 写成 `zh`、`zh-Hans`，实测都能得到中文。本站因此没有依赖标记，而是在中文叠加主题里显式指定 `dateFormat = "2006年1月2日"`（见 `themes/hugo-docs-theme-zh/hugo.toml`），用固定布局输出中文日期。

还有一处与上游表格不同：上游把 `:time_full` 写成 `11:44:58 pm Pacific Standard Time`，实测 0.167.0 上同一时间的 `:time_full` 只输出 `11:44:58 pm `（末尾一个空格，不含时区名），中文配置下为 ` 23:44:58`。

### 函数 `time.Format` 与 `time.Time` 的 `.Format` 方法：两处实测差异

这两者容易混用，但行为并不等价。在 Hugo 0.167.0、`timeZone = 'America/Denver'` 的站点上实测：

| 代码 | 实测输出 |
| --- | --- |
| `time.Format ":time_full" $t` | `11:44:58 pm `（本地化标记被识别） |
| `$t.Format ":time_full"` | `:time_full`（**标记被原样打印**，方法不认 Hugo 的本地化标记） |

时区缩写也常被误解。`MST` 能否输出成缩写，取决于**时间值本身带的是具名时区还是数字偏移**，与用函数还是方法无关：

| 输入 | 站点配置 | `time.Format "… MST" $t` | `$t.Format "… MST"` |
| --- | --- | --- | --- |
| `time.AsTime "2023-01-27T23:44:58-08:00"`（带偏移） | `timeZone = 'America/Denver'` | `… 11:44 PM -0800` | `… 11:44 PM -0800` |
| `time.AsTime "2023-01-27T23:44:58"`（不带偏移，落到配置时区） | `timeZone = 'America/Denver'` | `… 11:44 PM -0700` | `… 11:44 PM MST` |

结论：**想让读者看到时区名，输入里就不要带数字偏移**（或先用 [`time.In`](/functions/time/in/) 换到目标时区再交给 `.Format`）；否则只能拿到 `-0800` 这类偏移量。跨版本、跨平台显示时区名本身就不稳定，给读者的页面建议直接省略 `MST`，机器可读的时间用 `2006-01-02T15:04:05Z07:00`。

## 完整示例：给文章加一行时间

```go-html-template {file="layouts/_partials/post-meta.html"}
{{ $t := time.AsTime "2023-10-15T13:18:50-07:00" }}
<p>{{ time.Format "2006-01-02 15:04" $t }}</p>
<time datetime="{{ time.Format "2006-01-02T15:04:05Z07:00" $t }}">
  {{ time.Format ":date_long" $t }}
</time>
```

Hugo 渲染为（本站配置：`locale = 'zh-CN'`、`defaultContentLanguage = 'zh-cn'`、`timeZone = 'Asia/Shanghai'`）：

```html
<p>2023-10-15 13:18</p>
<time datetime="2023-10-15T13:18:50-07:00">
  October 15, 2023
</time>
```

**你应当看到什么**：第一行由布局字符串拼出，与站点语言无关；`datetime` 属性是机器可读的 ISO 形式；`<time>` 里的可见文本走本地化标记，在本站当前配置下实测是英文 `October 15, 2023`——原因与规避办法见上一小节。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，单语言站点，Windows。

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| `INPUT` 是不可解析的字符串（如 `"not a date"`） | —— | 是：`error calling Format: unable to parse date: not a date`，构建失败 |
| `INPUT` 是空字符串 `""` | —— | 是：`error calling Format: unable to parse date:` |
| `LAYOUT` 是空字符串 `""` | 空字符串 | 否 |
| `INPUT` 是整数 | 当作 Unix 时间戳（秒）：`time.Format "2006" 42` → `1970` | 否 |
| `INPUT` 是 `nil` | 零值时间：`time.Format "2006" nil` → `0001` | 否 |
| `LAYOUT` 写成 `yyyy-MM-dd` | 原样输出 `yyyy-MM-dd`（Go 的布局不是占位符语法，必须用参考时间 `2006-01-02`） | 否 |
| 布局里用 `MST` 打印时区缩写 | 看输入带不带具名时区：带数字偏移 → 输出偏移（实测 `-0800`）；不带偏移、落到配置的具名时区 → `time.Time` 的 `.Format` 输出缩写（实测 `MST`），`time.Format` 仍输出偏移。详见下文「函数与方法的实测差异」 | 否 |
| 返回类型 | 始终是 `string` | 否 |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 报错看不懂 | `error calling Format: unable to parse date: xxx` | `INPUT` 不是 `time.Time` 值，也不能按内置格式解析（常见于 front matter 里的日期写法不规范） | 改用完整 ISO 形式（如 `2023-10-15T13:18:50-07:00`），或先用 [`time.AsTime`](/functions/time/astime/) 试解析 |
| 没报错但结果不对 | 输出里出现 `yyyy`、`DD`、`mm` 这些字母 | 布局字符串写成了别的语言的格式串 | 改用 Go 参考时间 `Mon Jan 2 15:04:05 MST 2006` 的各组成部分 |
| 没报错但结果不对 | 日期差一天，或小时数不对 | 输入字符串的时区偏移、配置的 `timeZone`、`Etc/UTC` 三者的优先级没算对 | 按本页开头的优先级顺序检查；要换算就用 [`time.In`](/functions/time/in/) |
| 没报错但结果不对 | `:date_long` 等标记输出的不是中文 | Hugo 的本地化标记对部分语言会回退成英文 | 见上文实测表：改用固定布局（本站做法）或调整 `locale` |
| 没报错但结果不对 | 同一页面在不同机器上日期显示不一致 | 用了依赖系统时区或系统地区的写法 | 显示给读者用固定布局；机器可读的用 `2006-01-02T15:04:05Z07:00` |

更多排查入口见[故障排查](/troubleshooting/)。

[`timeZone`]: /configuration/all/#timezone
