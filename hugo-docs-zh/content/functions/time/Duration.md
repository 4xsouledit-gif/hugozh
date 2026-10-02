+++
title = "time.Duration"
linkTitle = "Duration"
description = "使用给定的时间单位与数值返回 time.Duration 值。"
date = 2026-10-02
weight = 30
source = "https://gohugo.io/functions/time/duration/"

[params.functions_and_methods]
signatures = ["time.Duration TIME_UNIT NUMBER"]
returnType = "time.Duration"
aliases = ["duration"]
+++

## 这一页解决什么问题

用「**数量 + 单位**」两个值构造一个时长（`time.Duration`），例如 24 小时、90 分钟，然后调用 Duration 的方法（`.Seconds`、`.Minutes`、`.Hours`）算出你要展示的数字。

**参数顺序与直觉相反**：单位在前、数量在后——`time.Duration "hour" 24` 才是「24 小时」（实测，写法写反会直接报错）。拿到的值是字符串时请改用 [`time.ParseDuration`](/functions/time/parseduration/)。

## 什么时候用，什么时候别用

**该用**：

- 手边是分开的「单位 + 数量」（例如配置里 `unit = "hour"`、`value = 24`）；
- 需要时长的计算方法（`.Seconds` 等）或把时长格式化输出。

**别用**：

- 手边是时长字符串（`"2h45m"`）→ 用 [`time.ParseDuration`](/functions/time/parseduration/)；
- 想算两个时间的间隔 → 直接相减得到 Duration，不需要构造；
- 想要日期/时间值而不是时长 → 用 [`time.AsTime`](/functions/time/astime/)；
- 想要「天」这个单位 → **不支持**（实测 `"day"` 报错），请用 `time.Duration "hour" 24` 折算。

## 用法

`time.Duration` 函数返回一个 [`time.Duration`][] 值，可与任意 `Duration` [方法][methods]配合使用。

以下模板：

```go-html-template
{{ $duration := time.Duration "hour" 24 }}
{{ printf "There are %.0f seconds in one day." $duration.Seconds }}
```

渲染为：

```text
There are 86400 seconds in one day.
```

时间单位必须是以下之一：

时长|有效时间单位
:--|:--
hours|`hour`, `h`
minutes|`minute`, `m`
seconds|`second`, `s`
milliseconds|`millisecond`, `ms`
microseconds|`microsecond`, `us`, `µs`
nanoseconds|`nanosecond`, `ns`

## 完整示例：构造时长并取秒数

```go-html-template {file="layouts/_partials/durations.html"}
{{ $d := time.Duration "hour" 24 }}
<p>{{ $d }}</p>
<p>秒：{{ $d.Seconds }}</p>
<p>分钟单位：{{ time.Duration "minute" 90 }}</p>
<p>零值：{{ time.Duration "hour" 0 }}</p>
<p>单位别名：{{ time.Duration "h" 1 }}</p>
```

Hugo 渲染为：

```html
<p>24h0m0s</p>
<p>秒：86400</p>
<p>分钟单位：1h30m0s</p>
<p>零值：0s</p>
<p>单位别名：1h0m0s</p>
```

**你应当看到什么**：时长的默认输出是规范形式（`24h0m0s`、`1h30m0s`，会自动进位）；`.Seconds` 返回秒数；单位可以用全称或缩写；数量为 0 得到 `0s`。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，单语言站点（`locale = 'zh-CN'`），Windows。

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| 单位无效（`"day"`） | —— | 是：`error calling Duration: "day" is not a valid duration unit` |
| 单位无效（`"fortnight"`） | —— | 是：`"fortnight" is not a valid duration unit` |
| 只传一个参数 | —— | 是：`wrong number of args for Duration: want 2 got 1` |
| 数量不是整数（`"x"`） | —— | 是：`unable to cast "x" of type string to int64` |
| 数量为 `0` | `0s` | 否 |
| 数量不宜整除（`minute` 90） | 自动进位成 `1h30m0s` | 否 |
| 返回类型 | `time.Duration` | 否 |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 报错看不懂 | `is not a valid duration unit` | 单位不在上表里（例如 `day`、`week`） | 用表里的单位；「天」写成 `time.Duration "hour" 24` |
| 报错看不懂 | `wrong number of args for Duration: want 2 got 1` | 忘了传数量 | 写成 `time.Duration "hour" 24`（单位在前） |
| 报错看不懂 | `unable to cast … to int64` | 数量是字符串（配置里加了引号） | 用整数，或先 `int` 转换 |
| 没报错但结果不对 | 想要的时长差了一个数量级 | 单位与数量写反或单位看错（`m` 是分钟，`ms` 才是毫秒） | 对照上表核对单位 |

更多排查入口见[故障排查](/troubleshooting/)。

[`time.Duration`]: https://pkg.go.dev/time#Duration
[methods]: /methods/duration/
