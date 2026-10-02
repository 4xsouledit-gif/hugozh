+++
title = "Minutes"
linkTitle = "Minutes"
description = "以浮点数形式返回该 time.Duration 值对应的分钟数。"
date = 2026-10-02
weight = 60
source = "https://gohugo.io/methods/duration/minutes/"

[params.functions_and_methods]
signatures = ["DURATION.Minutes"]
returnType = "float64"
+++

## 这一页解决什么问题

把 `time.Duration` 读成**分钟数**，用于显示或计算：视频时长、阅读时长、两个时间的间隔。

返回值是 `float64`，不是整数：`90s` 得到 `1.5`，`3.5h2.5m1.5s` 得到 `212.525`。

## 什么时候用，什么时候别用

**该用**：

- 需要分钟数这个**数字**（比较、排序、再计算）；
- 展示「约几分钟」，例如 `printf "%.0f" $d.Minutes`。

**别用**：

- 想要可读文本 → 直接打印 Duration（`{{ $d }}` → `3h32m31.5s`）；
- 想要秒或小时 → 用 [`Seconds`](/methods/duration/seconds/) / [`Hours`](/methods/duration/hours/)；
- 需要整数 → 分钟数常带小数，自己用 [`math.Floor`](/functions/math/floor/) 或 [`math.Ceil`](/functions/math/ceil/) 取整，别指望 `Minutes` 给你整数。

## 用法

上游示例：

```go-html-template
{{ $d = time.ParseDuration "3.5h2.5m1.5s" }}
{{ $d.Minutes }} → 212.525
```

## 完整示例：分钟数与控制小数位

```go-html-template {file="layouts/index.html"}
{{ $d := time.ParseDuration "3.5h2.5m1.5s" }}

<p>{{ $d }} → {{ $d.Minutes }} 分钟</p>
<p>90 秒 = {{ (time.ParseDuration "90s").Minutes }} 分钟</p>
<p>24 小时 = {{ (time.ParseDuration "24h").Minutes }} 分钟</p>
<p>零值 = {{ (time.ParseDuration "0s").Minutes }}</p>
```

Hugo 渲染为：

```html
<p>3h32m31.5s → 212.525 分钟</p>
<p>90 秒 = 1.5 分钟</p>
<p>24 小时 = 1440 分钟</p>
<p>零值 = 0</p>
```

**你应当看到什么**：`212.525` 里的小数就是 31.5 秒换算出来的部分；`90s` 是 `1.5` 分钟而不是 `90`；`24h` 是 `1440`；零值打印成 `0`（不带小数点）。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，单语言站点（`locale = 'en-US'`、`timeZone = 'UTC'`），Windows。

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| `3.5h2.5m1.5s` | `212.525` | 否 |
| `90s` | `1.5` | 否 |
| `24h` | `1440` | 否 |
| `0s`（零值） | `0` | 否 |
| 返回类型 | `float64` | 否 |
| 对字符串变量调用（`$s := "3h"`） | —— | 是：`can't evaluate field Minutes in type string` |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 报错看不懂 | `can't evaluate field Minutes in type string` | 值还是字符串，没解析成 `Duration` | 先 `time.ParseDuration` 或 `time.Duration` |
| 没报错但结果不对 | 显示 `212.525` 一长串 | 浮点默认输出没有格式化 | 用 `printf "%.0f"` / `"%.1f"` |
| 没报错但结果不对 | 90 秒得到 1.5，却按 1 分钟处理 | 小数部分是真实时间，不是噪声 | 需要整数时显式取整，并想清楚截断还是进位 |
| 没报错但结果不对 | 数值差 60 倍 | 把 `m`（分钟）当成了毫秒 `ms` | 单位写清楚；换单位用对应方法，不要手算乘数 |

更多排查入口见[故障排查](/troubleshooting/)。
