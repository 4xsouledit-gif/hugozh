+++
title = "Round"
linkTitle = "Round"
description = "返回把 DURATION1 舍入到最接近 DURATION2 整数倍后的结果。"
date = 2026-10-02
weight = 90
source = "https://gohugo.io/methods/duration/round/"

[params.functions_and_methods]
signatures = ["DURATION1.Round DURATION2"]
+++

## 这一页解决什么问题

把时长**舍入**到某个单位的整数倍，例如把 `3h32m31.5s` 舍入到整小时、整 15 分钟、整分钟。

`Round` 是「就近取舍」：落在两个倍数正中间时**远离零方向**取整（`3h32m31.5s` 对 `2h` 取整得到 `4h0m0s`）。需要「一律往零的方向砍掉」请用 [`Truncate`](/methods/duration/truncate/)。

返回的是新的 `Duration`（不是数字），可以继续接 [`Seconds`](/methods/duration/seconds/) 等读数方法。

## 什么时候用，什么时候别用

**该用**：

- 展示口径需要取整：把时长对齐到整小时、整 15 分钟、整秒；
- 缓存时间、分页时间间隔一类的「粒度」需求。

**别用**：

- 想砍掉零头而不是就近取舍 → 用 [`Truncate`](/methods/duration/truncate/)；
- 想对**时间点**取整（例如把某个 `time.Time` 归到当天零点）→ 用 [`time.Time`](/methods/time/) 一类方法自己拼日期，`Round` 只作用于时长；
- 想四舍五入成整数后参与比较 → 先 `Round` 到目标精度再 `.Seconds`，两步写清楚更不容易错。

## 用法

上游示例：

```go-html-template
{{ $d = time.ParseDuration "3.5h2.5m1.5s" }}

{{ $d.Round (time.ParseDuration "2h") }} → 4h0m0s
{{ $d.Round (time.ParseDuration "3m") }} → 3h33m0s
{{ $d.Round (time.ParseDuration "4s") }} → 3h32m32s
```

## 完整示例：对齐到整小时/整 15 分钟

```go-html-template {file="layouts/index.html"}
{{ $d := time.ParseDuration "3.5h2.5m1.5s" }}
{{ $n := time.ParseDuration "-3h30m" }}

<p>{{ $d.Round (time.ParseDuration "2h") }}</p>
<p>{{ $d.Round (time.ParseDuration "15m") }}</p>
<p>{{ $d.Round (time.ParseDuration "3m") }}</p>
<p>{{ $d.Round (time.ParseDuration "4s") }}</p>
<p>零倍数：{{ $d.Round (time.ParseDuration "0s") }}</p>
<p>负倍数：{{ $d.Round (time.ParseDuration "-2h") }}</p>
<p>负时长：{{ $n.Round (time.ParseDuration "1h") }}</p>
```

Hugo 渲染为：

```html
<p>4h0m0s</p>
<p>3h30m0s</p>
<p>3h33m0s</p>
<p>3h32m32s</p>
<p>零倍数：3h32m31.5s</p>
<p>负倍数：3h32m31.5s</p>
<p>负时长：-4h0m0s</p>
```

**你应当看到什么**：`3h32m31.5s` 对 `2h` 取整得到 `4h0m0s`（31.5 分钟已过半，向前进位）；对 `15m` 取整得到 `3h30m0s`；**倍数写 0 或负数时不报错，原值返回**；负时长 `-3h30m` 对 `1h` 取整得到 `-4h0m0s`（正中间的 −3.5h 远离零方向取到 −4h）。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，单语言站点（`locale = 'en-US'`、`timeZone = 'UTC'`），Windows。

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| `3h32m31.5s` 对 `2h` | `4h0m0s` | 否 |
| `3h32m31.5s` 对 `15m` | `3h30m0s` | 否 |
| `3h32m31.5s` 对 `3m` | `3h33m0s` | 否 |
| `3h32m31.5s` 对 `4s` | `3h32m32s` | 否 |
| 倍数为 `0s` | 原值返回 `3h32m31.5s` | 否 |
| 倍数为负数（`-2h`） | 原值返回 `3h32m31.5s` | 否 |
| 负时长 `-3h30m` 对 `1h` | `-4h0m0s`（正中间，远离零取整） | 否 |
| 参数直接写数字（`.Round 3`） | 当作 **3 纳秒**处理，`3h` 得到 `3h0m0s` | 否 |
| 参数写成字符串（`.Round "2h"`） | —— | 是：`expected integer; found "2h"` |
| 返回类型 | `time.Duration` | 否 |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 报错看不懂 | `expected integer; found "2h"` | 倍数写成了字符串 | 用 `time.ParseDuration "2h"` 包一层 |
| 没报错但结果不对 | 取整毫无效果 | 倍数是 `0s` 或负数（原值返回），或倍数比时长本身还大且刚好相等 | 核对倍数；把中间值打印出来看 |
| 没报错但结果不对 | 负时长的结果与预期方向相反 | `Round` 是「远离零」，不是「向零」 | 要砍零头用 [`Truncate`](/methods/duration/truncate/) |
| 没报错但结果不对 | 传了 `3` 却按 3 秒理解 | 数字参数按**纳秒**解释 | 一律用 `time.ParseDuration` 显式写单位 |
| 没报错但结果不对 | 取整后想拿到数字，却显示 `4h0m0s` | `Round` 返回 `Duration` | 再接 `.Hours` / `.Seconds` |

更多排查入口见[故障排查](/troubleshooting/)。
