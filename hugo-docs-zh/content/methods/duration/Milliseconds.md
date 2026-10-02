+++
title = "Milliseconds"
linkTitle = "Milliseconds"
description = "以整数形式返回该 time.Duration 值对应的毫秒数。"
date = 2026-10-02
weight = 50
source = "https://gohugo.io/methods/duration/milliseconds/"

[params.functions_and_methods]
signatures = ["DURATION.Milliseconds"]
returnType = "int64"
+++

## 这一页解决什么问题

把 `time.Duration` 读成**整数毫秒数**（1 毫秒 = 1000 微秒 = 1000000 纳秒）。

返回值是 `int64`，**不足 1 毫秒的部分被直接丢掉**（向零截断），不做四舍五入：`1500us` 得到 `1`，不是 `2`。

## 什么时候用，什么时候别用

**该用**：

- 需要毫秒级整数（例如把时长写进 `content` 属性、传给要求整数的参数）；
- 需要整数做比较或排序。

**别用**：

- 需要小数秒 → 用 [`Seconds`](/methods/duration/seconds/)；
- 需要更细的整数 → 用 [`Microseconds`](/methods/duration/microseconds/) 或 [`Nanoseconds`](/methods/duration/nanoseconds/)；
- 只想展示时长 → 直接打印 Duration（`{{ $d }}` → `3h32m31.5s`）。

## 用法

上游示例：

```go-html-template
{{ $d = time.ParseDuration "3.5h2.5m1.5s" }}
{{ $d.Milliseconds }} → 12751500
```

## 完整示例：毫秒数与被丢掉的小数

```go-html-template {file="layouts/index.html"}
{{ $d := time.ParseDuration "3.5h2.5m1.5s" }}

<p>{{ $d.Milliseconds }}</p>
<p>1.5 秒 = {{ (time.ParseDuration "1.5s").Milliseconds }} 毫秒</p>
<p>1500 微秒 = {{ (time.ParseDuration "1500us").Milliseconds }} 毫秒</p>
<p>零值 = {{ (time.ParseDuration "0s").Milliseconds }}</p>
```

Hugo 渲染为：

```html
<p>12751500</p>
<p>1.5 秒 = 1500 毫秒</p>
<p>1500 微秒 = 1 毫秒</p>
<p>零值 = 0</p>
```

**你应当看到什么**：第三行 `1500us` 是 1.5 毫秒，`.Milliseconds` 返回 `1`——小数被丢掉。另外注意第一行是 `12751500`：这个 Duration 含 1.5 秒，所以毫秒数不是整千。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，单语言站点（`locale = 'en-US'`、`timeZone = 'UTC'`），Windows。

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| `3.5h2.5m1.5s` | `12751500` | 否 |
| `1.5s` | `1500` | 否 |
| `1500us`（1.5 毫秒） | `1`（小数被丢弃，**不是** `2`） | 否 |
| `0s`（零值） | `0` | 否 |
| 返回类型 | `int64` | 否 |
| 对字符串变量调用（`$s := "3h"`） | —— | 是：`can't evaluate field Milliseconds in type string` |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 没报错但结果不对 | 数值比预期小 1000 倍 | 把 `Milliseconds` 与 [`Microseconds`](/methods/duration/microseconds/) 拿混了 | 1ms = 1000µs；不确定时先看 `{{ $d }}` |
| 没报错但结果不对 | 1.5 毫秒显示成 1 | 整数方法向零截断 | 需要小数用 `.Seconds`，或用 `.Microseconds` 自己换算 |
| 报错看不懂 | `can't evaluate field Milliseconds in type string` | 值还是字符串，没解析成 `Duration` | 先 `time.ParseDuration` 或 `time.Duration` |
| 报错看不懂 | `expected integer; found "..."` | 把字符串传给了需要 `Duration` 的参数 | 用 `time.ParseDuration` 包一层再传 |

更多排查入口见[故障排查](/troubleshooting/)。
