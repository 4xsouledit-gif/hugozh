+++
title = "time.In"
linkTitle = "In"
description = "返回给定日期/时间在指定 IANA 时区中的表示。"
date = 2026-10-02
weight = 50
source = "https://gohugo.io/functions/time/in/"

[params.functions_and_methods]
signatures = ["time.In TIMEZONE INPUT"]
returnType = "time.Time"
+++

## 这一页解决什么问题

同一个时刻在不同时区显示的时间不同。`time.In` 把已有的 `time.Time` **换算**到指定时区再返回（仍是同一时刻，只是「表示」变了），通常紧接着交给 [`time.Format`](/functions/time/format/) 输出。

它与 [`time.AsTime`](/functions/time/astime/) 的分工要分清：`time.AsTime` 的第二参数决定**解析字符串时**把没有时区的串当成哪个时区；`time.In` 是对**已经确定时刻**的值做换算。参数顺序是 `时区在前、时间在后`。

## 什么时候用，什么时候别用

**该用**：

- 给不同地区的读者显示当地时间；
- 把带数字偏移的时间先统一到某个具名时区，再格式化（也更容易拿到时区缩写，见 [`time.Format`](/functions/time/format/) 的实测说明）；
- 需要按某个时区的日界线做「今天/昨天」判断。

**别用**：

- 只想改显示格式、不改时区 → 用 [`time.Format`](/functions/time/format/)；
- 想把「没有时区的字符串」解释成某地时间 → 用 `time.AsTime` 的第二个参数；
- 拿到的是字符串还没解析 → 先用 [`time.AsTime`](/functions/time/astime/)。

## 用法

**（0.146.0 新增）**

`time.In` 函数返回给定日期/时间在指定 [IANA](g) 时区中的表示。

- 如果时区为空字符串或 `UTC`，时间以 [UTC](g) 返回。
- 如果时区为 `Local`，时间以系统的本地时区返回。
- 其它情况下，时区必须是有效的 IANA [时区名称][time zone name]。

```go-html-template
{{ $layout := "2006-01-02T15:04:05-07:00" }}
{{ $t := time.AsTime "2025-03-31T14:45:00-00:00" }}

{{ $t | time.In "America/Denver" | time.Format $layout }}     → 2025-03-31T08:45:00-06:00
{{ $t | time.In "Australia/Adelaide" | time.Format $layout }} → 2025-04-01T01:15:00+10:30
{{ $t | time.In "Europe/Oslo" | time.Format $layout }}        → 2025-03-31T16:45:00+02:00
```

## 完整示例：同一时刻换算到四个时区

```go-html-template {file="layouts/_partials/timezones.html"}
{{ $layout := "2006-01-02T15:04:05-07:00" }}
{{ $t := time.AsTime "2025-03-31T14:45:00-00:00" }}
<p>{{ $t | time.In "UTC" | time.Format $layout }}</p>
<p>{{ $t | time.In "America/Denver" | time.Format $layout }}</p>
<p>{{ $t | time.In "Australia/Adelaide" | time.Format $layout }}</p>
<p>{{ $t | time.In "Europe/Oslo" | time.Format $layout }}</p>
<p>空字符串（等同 UTC）：{{ $t | time.In "" | time.Format $layout }}</p>
```

Hugo 渲染为：

```html
<p>2025-03-31T14:45:00+00:00</p>
<p>2025-03-31T08:45:00-06:00</p>
<p>2025-04-01T01:15:00+10:30</p>
<p>2025-03-31T16:45:00+02:00</p>
<p>空字符串（等同 UTC）：2025-03-31T14:45:00+00:00</p>
```

**你应当看到什么**：五行表示的是**同一个时刻**（UTC 的 14:45），只是各地读数不同；`Australia/Adelaide` 已经跨到第二天（`04-01`）；空字符串按 UTC 处理。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，单语言站点（`locale = 'zh-CN'`，`timeZone = 'Asia/Shanghai'`），Windows。

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| 时区为空字符串 | 按 UTC 返回（实测 `+00:00`） | 否 |
| 时区为 `UTC` | 按 UTC 返回（实测 `+00:00`） | 否 |
| 时区为 `Local` | 按系统本地时区返回（实测在 Asia/Shanghai 机器上为 `+08:00`） | 否 |
| 时区名无效（`Bad/Zone`） | —— | 是：`error calling In: unknown time zone Bad/Zone` |
| 输入是字符串（不是 `time.Time`） | —— | 是：`can't handle "2025-03-31T14:45:00Z" for arg of type time.Time`，需先用 [`time.AsTime`](/functions/time/astime/) 解析 |
| 返回类型 | `time.Time`（同一时刻，仅表示不同） | 否 |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 报错看不懂 | `unknown time zone Bad/Zone` | 时区名拼错或不在 IANA 数据库 | 用标准名，如 `Asia/Shanghai`、`Europe/Oslo` |
| 没报错但结果不对 | 换算后时间没变 | 该时刻本来就属于该时区，或忘了接 `time.Format` 看结果 | 用 `time.Format` 指定布局输出后再核对 |
| 没报错但结果不对 | 输出带的是缩写而非偏移 | 具名时区才可能给出缩写；带数字偏移的输入不会 | 想稳定显示请用 `-07:00` 这类偏移布局（见 [`time.Format`](/functions/time/format/)） |
| 报错看不懂 | 参数顺序报错 | 写成了「时间在前」 | 记牢 `time.In TIMEZONE INPUT`，或用管道：`$t \| time.In "…"` |

更多排查入口见[故障排查](/troubleshooting/)。

[time zone name]: https://en.wikipedia.org/wiki/List_of_tz_database_time_zones#List
