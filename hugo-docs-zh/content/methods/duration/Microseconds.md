+++
title = "Microseconds"
linkTitle = "Microseconds"
description = "以整数形式返回该 time.Duration 值对应的微秒数。"
date = 2026-10-02
weight = 40
source = "https://gohugo.io/methods/duration/microseconds/"

[params.functions_and_methods]
signatures = ["DURATION.Microseconds"]
returnType = "int64"
+++

## 这一页解决什么问题

把 `time.Duration` 读成**整数微秒数**（1 微秒 = 1000 纳秒）。

返回值是 `int64`，**不足 1 微秒的部分被直接丢掉**（向零截断），不做四舍五入：`1500ns` 得到 `1`，不是 `2`。需要保留小数时改用 [`Seconds`](/methods/duration/seconds/) 一类的浮点方法。

## 什么时候用，什么时候别用

**该用**：

- 需要微秒级的整数值（性能计时、精确到微秒的时间戳换算）；
- 需要整数而不是浮点数做比较、排序或传给要求整数的函数。

**别用**：

- 需要小数精度 → 用 [`Seconds`](/methods/duration/seconds/)（浮点）或 [`Nanoseconds`](/methods/duration/nanoseconds/)（整数纳秒，更细）；
- 需要毫秒整数 → 用 [`Milliseconds`](/methods/duration/milliseconds/)；两者数值相差 1000 倍，写错不会报错，只会显示错数；
- 只想展示时长 → 直接打印 Duration 本身（`{{ $d }}`），得到 `3h32m31.5s` 这种规范形式。

## 用法

上游示例：

```go-html-template
{{ $d = time.ParseDuration "3.5h2.5m1.5s" }}
{{ $d.Microseconds }} → 12751500000
```

## 完整示例：整数截断看得见

```go-html-template {file="layouts/index.html"}
{{ $d := time.ParseDuration "3.5h2.5m1.5s" }}

<p>{{ $d.Microseconds }}</p>
<p>1.5 秒 = {{ (time.ParseDuration "1.5s").Microseconds }} 微秒</p>
<p>1500 纳秒 = {{ (time.ParseDuration "1500ns").Microseconds }} 微秒</p>
<p>零值 = {{ (time.ParseDuration "0s").Microseconds }}</p>
```

Hugo 渲染为：

```html
<p>12751500000</p>
<p>1.5 秒 = 1500000 微秒</p>
<p>1500 纳秒 = 1 微秒</p>
<p>零值 = 0</p>
```

**你应当看到什么**：注意第三行：`1500ns` 是 1.5 微秒，`.Microseconds` 返回 `1`——**小数被丢掉了，不是四舍五入**。需要 1.5 就换成 `.Nanoseconds` 再自己除，或改用浮点方法。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，单语言站点（`locale = 'en-US'`、`timeZone = 'UTC'`），Windows。

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| `3.5h2.5m1.5s` | `12751500000` | 否 |
| `1.5s` | `1500000` | 否 |
| `1500ns`（1.5 微秒） | `1`（小数被丢弃，**不是** `2`） | 否 |
| `0s`（零值） | `0` | 否 |
| 返回类型 | `int64` | 否 |
| 对字符串变量调用（`$s := "3h"`） | —— | 是：`can't evaluate field Microseconds in type string` |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 没报错但结果不对 | 毫秒数当成微秒数（差 1000 倍） | `Milliseconds` 与 `Microseconds` 拿错了 | 记住 1ms = 1000µs；不确定时先用 `{{ $d }}` 看规范输出 |
| 没报错但结果不对 | 1.5 微秒显示成 1 | 整数方法向零截断 | 需要小数用 `.Seconds`，或用 `.Nanoseconds` 自己换算 |
| 报错看不懂 | `can't evaluate field Microseconds in type string` | 值还是字符串，没解析成 `Duration` | 先 `time.ParseDuration` 或 `time.Duration` |
| 报错看不懂 | `can't evaluate field Microseconds in type int` | 对整数套用了 `Duration` 的方法 | 先构造 `Duration` |

更多排查入口见[故障排查](/troubleshooting/)。
