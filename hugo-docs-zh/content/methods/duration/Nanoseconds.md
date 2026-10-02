+++
title = "Nanoseconds"
linkTitle = "Nanoseconds"
description = "以整数形式返回该 time.Duration 值对应的纳秒数。"
date = 2026-10-02
weight = 70
source = "https://gohugo.io/methods/duration/nanoseconds/"

[params.functions_and_methods]
signatures = ["DURATION.Nanoseconds"]
returnType = "int64"
+++

## 这一页解决什么问题

把 `time.Duration` 读成**整数纳秒数**，是 Duration 能得到的最细粒度读数（Duration 内部本身就按整数纳秒存储，所以这个方法不丢精度）。

返回值是 `int64`。正因为它是整数，长时长的数值会很大：`3.5h2.5m1.5s` 是 `12751500000000`（约 1.28 × 10¹³），已经超出 `float64` 能精确表示所有整数的范围，需要精确比较大数时优先用它而不是浮点方法。

## 什么时候用，什么时候别用

**该用**：

- 需要最细粒度、且不丢小数的整数读数；
- 要做精确比较或精确换算（纳秒是所有单位的公分母）。

**别用**：

- 只是想展示时长 → 直接打印 Duration（`{{ $d }}` → `3h32m31.5s`）；十几位的纳秒数字对人类没有用；
- 需要秒/毫秒 → 用 [`Seconds`](/methods/duration/seconds/) / [`Milliseconds`](/methods/duration/milliseconds/)，别自己除 10 的幂（容易少写或多写一个零）；
- 需要小数秒 → 用 [`Seconds`](/methods/duration/seconds/)。

## 用法

上游示例：

```go-html-template
{{ $d = time.ParseDuration "3.5h2.5m1.5s" }}
{{ $d.Nanoseconds }} → 12751500000000
```

## 完整示例：纳秒数与小单位

```go-html-template {file="layouts/index.html"}
{{ $d := time.ParseDuration "3.5h2.5m1.5s" }}

<p>{{ $d.Nanoseconds }}</p>
<p>1.5 微秒 = {{ (time.ParseDuration "1.5us").Nanoseconds }} 纳秒</p>
<p>零值 = {{ (time.ParseDuration "0s").Nanoseconds }}</p>
```

Hugo 渲染为：

```html
<p>12751500000000</p>
<p>1.5 微秒 = 1500 纳秒</p>
<p>零值 = 0</p>
```

**你应当看到什么**：只要是合法 Duration，`.Nanoseconds` 都是整数，**不会丢小数**（`1.5us` 得到 `1500`）；换算关系是 1µs = 1000ns、1ms = 1000000ns、1s = 1000000000ns。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，单语言站点（`locale = 'en-US'`、`timeZone = 'UTC'`），Windows。

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| `3.5h2.5m1.5s` | `12751500000000` | 否 |
| `1.5us` | `1500`（**不丢小数**） | 否 |
| `0s`（零值） | `0` | 否 |
| `1000000h` | `3600000000000000000` | 否 |
| `2562047h47m16.854775807s`（`time.Duration` 上限） | `9223372036854775807`（`int64` 最大值） | 否 |
| 超过上限（`2562048h`） | —— | 是：`error calling ParseDuration: time: invalid duration "2562048h"` |
| 返回类型 | `int64` | 否 |
| 对字符串变量调用（`$s := "3h"`） | —— | 是：`can't evaluate field Nanoseconds in type string` |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 报错看不懂 | `can't evaluate field Nanoseconds in type string` | 值还是字符串，没解析成 `Duration` | 先 `time.ParseDuration` 或 `time.Duration` |
| 没报错但结果不对 | 数值少/多一个零 | 手算 10 的幂时数错位数 | 用 [`Milliseconds`](/methods/duration/milliseconds/) 等方法，别手算 |
| 没报错但结果不对 | 页面上显示十几位数字 | 纳秒对读者不友好 | 换成 `.Seconds`，或直接打印 Duration |
| 没报错但结果不对 | 与其他单位比较时结果反了 | 拿纳秒数与秒数直接比较 | 先把两边换算到同一单位 |

更多排查入口见[故障排查](/troubleshooting/)。
