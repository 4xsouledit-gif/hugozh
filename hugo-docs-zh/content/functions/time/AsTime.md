+++
title = "time.AsTime"
linkTitle = "AsTime"
description = "把日期/时间值的给定字符串表示返回为 time.Time 值。"
date = 2026-10-02
weight = 20
source = "https://gohugo.io/functions/time/astime/"

[params.functions_and_methods]
signatures = ["time.AsTime INPUT [TIMEZONE]"]
returnType = "time.Time"
aliases = ["time"]
+++

## 这一页解决什么问题

Hugo 里所有日期/时间的格式化和运算都建立在 `time.Time` 值上，而字符串不是 `time.Time`。`time.AsTime` 就是那座桥：把 front matter 里的自定义日期、数据文件里的日期串、URL 参数这类**字符串**转成 `time.Time`，之后才能安全地格式化、比较、换算时区。

判断要不要用它的办法很简单：**值是不是 `time.Time`？** 不是（是字符串），就先过 `time.AsTime`。

## 什么时候用，什么时候别用

**该用**：

- 自定义日期是字符串（YAML/JSON，或加引号的 TOML 日期）；
- 从 `hugo.Data`、配置或查询参数里读到日期串；
- 需要在解析时指定时区（第二个参数）。

**别用**：

- 值已经是 `time.Time`（`.Date`、`.Lastmod`、`now`、未加引号的 TOML 日期）→ 直接用，`time.AsTime` 不是必需的；
- 只是想格式化输出 → 直接 [`time.Format`](/functions/time/format/)（它也能隐式解析常见字符串，见该页实测边界）；
- 想解析的是**时长**（`"2h45m"`）→ 用 [`time.ParseDuration`](/functions/time/parseduration/)。

## 概述

Hugo 提供了[函数][functions]与[方法][methods]来格式化、本地化、解析、比较与操作日期/时间值。要对日期/时间值的字符串表示做这些操作，必须先使用 `time.AsTime` 函数把它们转换成 [`time.Time`][] 值。

```go-html-template
{{ $t := "2023-10-15T13:18:50-07:00" }}
{{ time.AsTime $t }} → 2023-10-15 13:18:50 -0700 PDT (time.Time)
```

## 可解析的字符串

如上所示，第一个参数必须是可解析的日期/时间值字符串表示。例如：

格式|时区
:--|:--
`2023-10-15T13:18:50-07:00`|`America/Los_Angeles`
`2023-10-15T13:18:50-0700`|`America/Los_Angeles`
`2023-10-15T13:18:50Z`|`Etc/UTC`
`2023-10-15T13:18:50`|默认为 `Etc/UTC`
`2023-10-15`|默认为 `Etc/UTC`
`15 Oct 2023`|默认为 `Etc/UTC`

最后三个示例不是完整限定的时间，默认使用 `Etc/UTC` 时区。

要覆盖默认时区，请在项目配置中设置 [`timeZone`][]，或给 `time.AsTime` 函数传入第二个参数。例如：

```go-html-template
{{ time.AsTime "15 Oct 2023" "America/Los_Angeles" }}
```

有效时区列表可能因系统而异，但应当包含 `UTC`、`Local`，或 [IANA 时区数据库][IANA Time Zone database]中的任何位置。

确定时区时的优先级顺序为：

1. 日期/时间字符串中的时区偏移
1. 传给 `time.AsTime` 函数的第二个参数所指定的时区
1. 项目配置中指定的时区
1. `Etc/UTC` 时区

## 完整示例：解析与指定时区

```go-html-template {file="layouts/_partials/date-parse.html"}
{{ $t := time.AsTime "2023-10-15T13:18:50-07:00" }}
<p>类型：{{ printf "%T" $t }}</p>
<p>默认输出：{{ $t }}</p>
<p>指定时区：{{ time.AsTime "15 Oct 2023" "America/Los_Angeles" }}</p>
<p>整数当作 Unix 秒：{{ time.AsTime 0 }}</p>
```

Hugo 渲染为（该临时站点配置 `timeZone = "Asia/Shanghai"`）：

```html
<p>类型：time.Time</p>
<p>默认输出：2023-10-15 13:18:50 -0700 -0700</p>
<p>指定时区：2023-10-15 00:00:00 -0700 PDT</p>
<p>整数当作 Unix 秒：1970-01-01 08:00:00 +0800 CST</p>
```

**你应当看到什么**：返回类型是 `time.Time`；解析结果**保留字符串里的偏移**（第一行末尾是 `-0700`，注意它显示的是偏移量而不是上游示例里的时区缩写 `PDT`）；第二个参数为不带时区的字符串指定时区；整数被当作 Unix 时间戳，并受项目配置的 `timeZone` 影响。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，单语言站点（`locale = 'zh-CN'`，`timeZone = 'Asia/Shanghai'`），Windows。

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| 不可解析的字符串（`"not a date"`） | —— | 是：`error calling AsTime: unable to parse date: not a date` |
| 空字符串 `""` | —— | 是：`error calling AsTime: unable to parse date: ` |
| 第二个参数是无效时区（`"Not/AZone"`） | —— | 是：`error calling AsTime: unknown time zone Not/AZone` |
| 输入是 `nil` | 零值时间 `0001-01-01 00:00:00 +0000 UTC` | 否 |
| 输入是整数 | 当作 Unix 时间戳（秒）：`time.AsTime 0` 得 `1970-01-01 08:00:00 +0800 CST`（受 `timeZone` 影响） | 否 |
| 带数字偏移的字符串 | 输出末尾是偏移量（实测 `… -0700 -0700`），不是时区缩写 | 否 |
| 返回类型 | `time.Time` | 否 |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 报错看不懂 | `unable to parse date: xxx` | 字符串不是受支持的格式（常见于 front matter 里的日期写法不规范） | 改成完整 ISO 形式（如 `2023-10-15T13:18:50-07:00`），或检查有没有拼写错误 |
| 报错看不懂 | `unknown time zone Not/AZone` | 第二个参数的时区名不在 IANA 数据库里 | 用 [IANA 时区名][IANA Time Zone database]（如 `Asia/Shanghai`） |
| 没报错但结果不对 | 日期差一天或小时数不对 | 字符串带了偏移，而你以为是配置里的时区 | 记住优先级：字符串偏移 > 第二参数 > 项目配置 > `Etc/UTC` |
| 没报错但结果不对 | 输出里出现 `0001-01-01` | 传了 `nil`，得到零值时间 | 先用 `with` 判空再解析 |

更多排查入口见[故障排查](/troubleshooting/)。

[IANA Time Zone database]: https://en.wikipedia.org/wiki/List_of_tz_database_time_zones
[`time.Time`]: https://pkg.go.dev/time#Time
[`timeZone`]: /configuration/all/#timezone
[functions]: /functions/time/
[methods]: /methods/time/
