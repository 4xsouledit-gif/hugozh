+++
title = "Seconds"
linkTitle = "Seconds"
description = "以浮点数形式返回该 time.Duration 值对应的秒数。"
date = 2026-10-02
weight = 80
source = "https://gohugo.io/methods/duration/seconds/"

[params.functions_and_methods]
signatures = ["DURATION.Seconds"]
returnType = "float64"
+++

## 这一页解决什么问题

把 `time.Duration` 读成**秒数**，是本章最常用的读数方法：两个时间相差多少秒、一个时长等于多少秒，都用它。

返回值是 `float64`，所以小数秒不会丢：`300ms` 得到 `0.3`，`3.5h2.5m1.5s` 得到 `12751.5`。正因为它返回数字，可以直接参与算术和比较。

## 什么时候用，什么时候别用

**该用**：

- 需要秒数这个**数字**（比较、排序、再计算）；
- 把时长转成「秒」放进机器可读的输出（结构化数据、`content` 属性）。

**别用**：

- 想展示给读者看 → 直接打印 Duration（`{{ $d }}` → `3h32m31.5s`），或用 [`time.Time.Format`](/methods/time/format/) 处理时间；
- 需要分钟/小时 → 用 [`Minutes`](/methods/duration/minutes/) / [`Hours`](/methods/duration/hours/)；
- 需要整数纳秒/毫秒 → 用 [`Nanoseconds`](/methods/duration/nanoseconds/) / [`Milliseconds`](/methods/duration/milliseconds/)（它们的小数会被截断）；
- 想解析时长字符串 → 那是 [`time.ParseDuration`](/functions/time/parseduration/) 的活，不是 `Seconds`。

## 用法

上游示例：

```go-html-template
{{ $d = time.ParseDuration "3.5h2.5m1.5s" }}
{{ $d.Seconds }} → 12751.5
```

## 完整示例：秒数与小数秒

```go-html-template {file="layouts/index.html"}
{{ $d := time.ParseDuration "3.5h2.5m1.5s" }}

<p>{{ $d }} → {{ $d.Seconds }} 秒</p>
<p>24 小时 = {{ (time.ParseDuration "24h").Seconds }} 秒</p>
<p>300 毫秒 = {{ (time.ParseDuration "300ms").Seconds }} 秒</p>
<p>零值 = {{ (time.ParseDuration "0s").Seconds }}</p>
```

Hugo 渲染为：

```html
<p>3h32m31.5s → 12751.5 秒</p>
<p>24 小时 = 86400 秒</p>
<p>300 毫秒 = 0.3 秒</p>
<p>零值 = 0</p>
```

**你应当看到什么**：`300ms` 得到 `0.3`（小数秒没有被丢掉）；`24h` 得到 `86400`；零值打印成 `0`。如果你的代码里得到 `300`，那是毫秒数——说明用错了方法。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，单语言站点（`locale = 'en-US'`、`timeZone = 'UTC'`），Windows。

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| `3.5h2.5m1.5s` | `12751.5` | 否 |
| `24h` | `86400` | 否 |
| `300ms` | `0.3`（小数保留） | 否 |
| `0s`（零值） | `0` | 否 |
| 返回类型 | `float64` | 否 |
| 对字符串变量调用（`$s := "3h"`） | —— | 是：`can't evaluate field Seconds in type string` |
| 对整数调用（`$n := 3`） | —— | 是：`can't evaluate field Seconds in type int` |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 报错看不懂 | `can't evaluate field Seconds in type string` | 值还是字符串，没解析成 `Duration` | 先 `time.ParseDuration` 或 `time.Duration` |
| 报错看不懂 | `can't evaluate field Seconds in type int` | 对整数调用 Duration 的方法 | 先构造 `Duration`，或直接算数字 |
| 没报错但结果不对 | 300 毫秒得到 300 | 用的是 [`Milliseconds`](/methods/duration/milliseconds/) | 换回 `Seconds`，数值应小 1000 倍 |
| 没报错但结果不对 | 页面显示 `12751.5` 而读者看不懂 | 把数字直接当文本输出 | 展示用 Duration 本身，或先格式化文本 |

更多排查入口见[故障排查](/troubleshooting/)。
