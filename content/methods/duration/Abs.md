+++
title = "Abs"
linkTitle = "Abs"
description = "返回给定 time.Duration 值的绝对值。"
date = 2026-10-02
weight = 20
source = "https://gohugo.io/methods/duration/abs/"

[params.functions_and_methods]
signatures = ["DURATION.Abs"]
returnType = "time.Duration"
+++

## 这一页解决什么问题

`Abs` 只做一件事：**去掉时长的符号**。

两个 `time.Time` 相减（[`time.Time.Sub`](/methods/time/sub/)）得到的是 `time.Duration`，谁减谁决定了结果是正还是负。直接显示就会出现 `-25h10m20s` 这种读者看不懂的值；`.Abs` 把它变成 `25h10m20s`，含义是「相差 25 小时 10 分 20 秒」，不关心谁在前。

## 什么时候用，什么时候别用

**该用**：

- 只关心「相差多久」，不关心方向（例如两篇文章发布时间的间隔、缓存有效期）；
- 上游数据里的时长带了负号，只想显示大小。

**别用**：

- 需要知道方向（哪一侧更早）→ 保留原始 `Duration` 的符号，或用 [`time.Time.Before`](/methods/time/before/) / [`time.Time.After`](/methods/time/after/) 判断先后；
- 想做取整 → 用 [`Round`](/methods/duration/round/) 或 [`Truncate`](/methods/duration/truncate/)；
- 想直接拿到数字 → 用 [`Seconds`](/methods/duration/seconds/)、[`Hours`](/methods/duration/hours/) 等读数方法；`Abs` 返回的仍然是 `Duration`。

## 用法

上游示例（`$d` 需要用 [`time.ParseDuration`](/functions/time/parseduration/) 先构造）：

```go-html-template
{{ $d = time.ParseDuration "-3h" }}
{{ $d.Abs }} → 3h0m0s
```

## 完整示例：把负的时长差变成「相差多久」

假设有两个时间：`2023-01-27T23:44:58-08:00` 与 `2023-01-26T22:34:38-08:00`。直接相减得到负值，取绝对值后就是「相差多久」：

```go-html-template {file="layouts/index.html"}
{{ $a := time.AsTime "2023-01-27T23:44:58-08:00" }}
{{ $b := time.AsTime "2023-01-26T22:34:38-08:00" }}
{{ $gap := $b.Sub $a }}

<p>直接相减：{{ $gap }}</p>
<p>取绝对值：{{ $gap.Abs }}</p>
<p>取绝对值后的小时数：{{ $gap.Abs.Hours }}</p>
```

Hugo 渲染为：

```html
<p>直接相减：-25h10m20s</p>
<p>取绝对值：25h10m20s</p>
<p>取绝对值后的小时数：25.17222222222222</p>
```

**你应当看到什么**：`$b` 早于 `$a`，所以直接相减得到负的 `-25h10m20s`；`.Abs` 去掉符号后是 `25h10m20s`；再接 `.Hours` 得到浮点数 `25.17222222222222`（不是 `25`，也不是 `25h`）。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，单语言站点（`locale = 'en-US'`、`timeZone = 'UTC'`），Windows。

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| `-3h` | `3h0m0s` | 否 |
| `0s`（零值） | `0s` | 否 |
| `-1ns` | `1ns` | 否 |
| `90s` | `1m30s`（输出是规范形式，不是 `90s`） | 否 |
| `24h`（正数） | `24h0m0s`，原样返回 | 否 |
| `3.5h2.5m1.5s` | `3h32m31.5s`，原样返回 | 否 |
| 返回类型 | `time.Duration`（可继续接 `Hours`、`Seconds`） | 否 |
| 对字符串变量调用（`$s := "3h"`） | —— | 是：`can't evaluate field Abs in type string` |
| 对整数调用（`$n := 3`） | —— | 是：`can't evaluate field Abs in type int` |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 报错看不懂 | `can't evaluate field Abs in type string` | 值还是字符串（例如直接拿了前置元数据里的 `"3h"`），没解析成 `Duration` | 先 `time.ParseDuration` 再 `.Abs` |
| 报错看不懂 | `can't evaluate field Abs in type int` | 对整数套用了 `Duration` 的方法 | 先构造 `Duration`；整数求绝对值用 [`math.Abs`](/functions/math/abs/) |
| 没报错但结果不对 | 页面显示 `-3h0m0s` | 忘了 `.Abs`，或减法顺序写反了 | 套上 `.Abs`，或核对两个时间谁在前 |
| 没报错但结果不对 | 想要 `90`，却得到 `1m30s` | `.Abs` 返回的是 `Duration`，不是数字 | 后面接 `.Seconds` |
| 没报错但结果不对 | 想要 `25` 小时，却得到 `25.17222222222222` | `.Hours` 返回浮点数 | 用 `printf "%.1f"` 控制小数位，或 [`math.Round`](/functions/math/round/) 取整 |

更多排查入口见[故障排查](/troubleshooting/)。
