+++
title = "time.ParseDuration"
linkTitle = "ParseDuration"
description = "解析给定的时长字符串，返回 time.Duration 值。"
date = 2026-10-02
weight = 70
source = "https://gohugo.io/functions/time/parseduration/"

[params.functions_and_methods]
signatures = ["time.ParseDuration DURATION"]
returnType = "time.Duration"
+++

## 这一页解决什么问题

把**时长字符串**（`"24h"`、`"2h45m"`、`"300ms"`、`"-1.5h"`）解析成 `time.Duration`，之后可以用 Duration 的方法算出秒数/分钟数。

职责划分很简单：**字符串进来 → `time.ParseDuration`；「数量 + 单位」两个值进来 → [`time.Duration`](/functions/time/duration/)**。两者返回同一个类型。

## 什么时候用，什么时候别用

**该用**：

- 配置或前置元数据里写的是时长字符串（对写配置的人最友好）；
- 需要把人类可读的时长转成可计算的 Duration。

**别用**：

- 手边是「数量 + 单位」（如 `unit = "hour"`、`value = 24`）→ 用 [`time.Duration`](/functions/time/duration/)；
- 想解析的是**日期**不是时长 → 用 [`time.AsTime`](/functions/time/astime/)；
- 想算两个时间的间隔 → 直接相减，结果本来就是 Duration；
- 想表示「天」→ 时长单位里没有 `d`（实测报错），写成 `"24h"` 或 `"48h"`。

## 用法

`time.ParseDuration` 函数返回一个 [`time.Duration`][] 值，可与任意 `Duration` [方法][methods]配合使用。

时长字符串是可能带符号的十进制数序列，每个数可带小数部分与单位后缀，例如 `300ms`、`-1.5h` 或 `2h45m`。有效的时间单位为 `ns`、`us`（或 `µs`）、`ms`、`s`、`m`、`h`。

以下模板：

```go-html-template
{{ $duration := time.ParseDuration "24h" }}
{{ printf "There are %.0f seconds in one day." $duration.Seconds }}
```

渲染为：

```text
There are 86400 seconds in one day.
```

## 完整示例：几种常见时长字符串

```go-html-template {file="layouts/_partials/parse-duration.html"}
{{ $d := time.ParseDuration "24h" }}
<p>{{ $d }}</p>
<p>秒：{{ $d.Seconds }}</p>
<p>组合单位：{{ time.ParseDuration "2h45m" }}</p>
<p>毫秒：{{ time.ParseDuration "300ms" }}</p>
<p>负数与小数：{{ time.ParseDuration "-1.5h" }}</p>
<p>零值：{{ time.ParseDuration "0s" }}</p>
```

Hugo 渲染为：

```html
<p>24h0m0s</p>
<p>秒：86400</p>
<p>组合单位：2h45m0s</p>
<p>毫秒：300ms</p>
<p>负数与小数：-1h30m0s</p>
<p>零值：0s</p>
```

**你应当看到什么**：时长按规范形式输出（`2h45m0s`、`-1h30m0s`）；多个单位可以连写；支持负数与小数；`0s` 是合法输入。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，单语言站点（`locale = 'zh-CN'`），Windows。

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| 合法字符串（`"24h"`、`"2h45m"`、`"300ms"`、`"-1.5h"`、`"0s"`） | `time.Duration` | 否 |
| 缺少单位（`"24"`） | —— | 是：`error calling ParseDuration: time: missing unit in duration "24"` |
| 空字符串 `""` | —— | 是：`error calling ParseDuration: time: invalid duration ""` |
| 不支持的单位（`"1d"`） | —— | 是：`time: unknown unit "d" in duration "1d"`（没有「天」） |
| 输入是数字（如 `42`） | —— | 是：`time: missing unit in duration "42"`（会先被当成字符串 `"42"` 解析） |
| 返回类型 | `time.Duration`（默认输出 `24h0m0s` 这种规范形式） | 否 |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 报错看不懂 | `missing unit in duration "24"` | 数字没带单位 | 写成 `"24h"` |
| 报错看不懂 | `unknown unit "d"` | 用了「天」`d`（Go 的时长语法没有天） | 换算成小时：`"24h"` |
| 报错看不懂 | `invalid duration ""` | 配置项是空字符串 | 给配置项设默认值，或先用 `with` 判空 |
| 没报错但结果不对 | 秒数与预期差 60 倍 | 把 `m`（分钟）当成了毫秒 | 毫秒是 `ms`，分钟是 `m` |

更多排查入口见[故障排查](/troubleshooting/)。

[`time.Duration`]: https://pkg.go.dev/time#Duration
[methods]: /methods/duration/
