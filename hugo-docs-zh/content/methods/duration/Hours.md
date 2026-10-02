+++
title = "Hours"
linkTitle = "Hours"
description = "以浮点数形式返回该 time.Duration 值对应的小时数。"
date = 2026-10-02
weight = 30
source = "https://gohugo.io/methods/duration/hours/"

[params.functions_and_methods]
signatures = ["DURATION.Hours"]
returnType = "float64"
+++

## 这一页解决什么问题

把 `time.Duration` 读成**小时数**，用于显示或参与计算：阅读时长、视频长度、两个日期的间隔。

返回值是 `float64`，不是整数：`90m` 得到 `1.5`，`3.5h2.5m1.5s` 得到 `3.5420833333333333`。因为它是数字，所以可以直接参与算术和比较，也可以交给 `printf` 控制小数位。

## 什么时候用，什么时候别用

**该用**：

- 需要小时数这个**数字**（排序、比较、再计算）；
- 需要「约几小时」的展示，例如 `printf "%.1f" $d.Hours` 得到 `3.5`。

**别用**：

- 想要严谨的整数（例如「几小时几分钟」）→ 小时数会带小数；整数用 [`Milliseconds`](/methods/duration/milliseconds/) 一类的整数方法，或自己用 [`math.Floor`](/functions/math/floor/) 取整；
- 想要可读的时长文本（`3h32m31.5s`）→ **不要**用 `Hours`；直接打印 Duration 本身即可（`{{ $d }}`），或用 [`time.Time.Format`](/methods/time/format/) 处理时间；
- 想要秒或分钟 → 用 [`Seconds`](/methods/duration/seconds/) / [`Minutes`](/methods/duration/minutes/)，别自己乘 60（容易与 `m`/`ms` 混淆）。

## 用法

上游示例：

```go-html-template
{{ $d = time.ParseDuration "3.5h2.5m1.5s" }}
{{ $d.Hours }} → 3.5420833333333333
```

## 完整示例：读小时数并控制小数位

```go-html-template {file="layouts/index.html"}
{{ $d := time.ParseDuration "3.5h2.5m1.5s" }}

<p>原始：{{ $d }}</p>
<p>小时数：{{ $d.Hours }}</p>
<p>保留一位小数：{{ printf "%.1f" $d.Hours }}</p>
<p>整 24 小时：{{ (time.ParseDuration "24h").Hours }}</p>
<p>90 分钟：{{ (time.ParseDuration "90m").Hours }}</p>
```

Hugo 渲染为：

```html
<p>原始：3h32m31.5s</p>
<p>小时数：3.5420833333333333</p>
<p>保留一位小数：3.5</p>
<p>整 24 小时：24</p>
<p>90 分钟：1.5</p>
```

**你应当看到什么**：同一个 Duration 打印出来是 `3h32m31.5s`，`.Hours` 却是浮点数 `3.5420833333333333`；整数小时打印成 `24`（不带 `.0`）；`90m` 是 `1.5` 而不是 `90`——`Hours` 换算成小时。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，单语言站点（`locale = 'en-US'`、`timeZone = 'UTC'`），Windows。

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| `3.5h2.5m1.5s` | `3.5420833333333333` | 否 |
| `24h` | `24`（整数不带小数点） | 否 |
| `90m` | `1.5` | 否 |
| `0s`（零值） | `0` | 否 |
| 负时长 `-1.5h` | `-1.5`（符号保留） | 否 |
| 返回类型 | `float64` | 否 |
| 对字符串变量调用（`$s := "3h"`） | —— | 是：`can't evaluate field Hours in type string` |
| 对整数调用（`$n := 3`） | —— | 是：`can't evaluate field Hours in type int` |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 报错看不懂 | `can't evaluate field Hours in type string` | 值还是字符串，没解析成 `Duration` | 先 `time.ParseDuration` 或 `time.Duration` |
| 没报错但结果不对 | 页面显示 `3.5420833333333333` 一长串 | `float64` 的默认输出没做格式化 | 用 `printf "%.1f"`、`%.2f` 控制小数位 |
| 没报错但结果不对 | `Hours` 得到 `1.5`，却按「1 小时」处理 | 浮点数的小数部分就是 30 分钟，不是噪声 | 需要整数时显式取整，并想清楚截断还是四舍五入 |
| 没报错但结果不对 | 秒数差 60 倍 | 把 `m`（分钟）当成了毫秒 | 毫秒是 `ms`；换单位请用对应方法，别手算乘数 |

更多排查入口见[故障排查](/troubleshooting/)。
