+++
title = "Truncate"
linkTitle = "Truncate"
description = "返回把 DURATION1 向零方向截断到 DURATION2 整数倍后的结果。"
date = 2026-10-02
weight = 100
source = "https://gohugo.io/methods/duration/truncate/"

[params.functions_and_methods]
signatures = ["DURATION1.Truncate DURATION2"]
returnType = "time.Duration"
+++

## 这一页解决什么问题

把时长**截断**到某个单位的整数倍：只保留「完整的」单位数，零头一律丢掉，**不做进位**。

和 [`Round`](/methods/duration/round/) 的区别只有一个，但结果常常不同：`Round` 是就近取舍，`Truncate` 是向零砍掉。例如 `3h32m31.5s` 对 `2h` 取整：`Round` 得 `4h0m0s`，`Truncate` 得 `2h0m0s`。

返回的是新的 `Duration`（不是数字）。

## 什么时候用，什么时候别用

**该用**：

- 只关心「已经过去的完整单位」（整小时、整分钟、整秒）；
- 统计口径不允许超过实际值（例如「已用时」显示成整分钟，不能显示比实际更大的数）。

**别用**：

- 想就近取舍 → 用 [`Round`](/methods/duration/round/)；
- 想对**时间点**截断（例如把 `time.Time` 归到当天零点）→ `Truncate` 只处理时长，日期要自己拼或用时间方法；
- 想格式化时长文本 → 直接打印 Duration（`{{ $d }}`）。

## 用法

上游示例：

```go-html-template
{{ $d = time.ParseDuration "3.5h2.5m1.5s" }}

{{ $d.Truncate (time.ParseDuration "2h") }} → 2h0m0s
{{ $d.Truncate (time.ParseDuration "3m") }} → 3h30m0s
{{ $d.Truncate (time.ParseDuration "4s") }} → 3h32m28s
```

## 完整示例：与 Round 对照

```go-html-template {file="layouts/index.html"}
{{ $d := time.ParseDuration "3.5h2.5m1.5s" }}
{{ $n := time.ParseDuration "-3h30m" }}

<p>{{ $d.Truncate (time.ParseDuration "2h") }}</p>
<p>{{ $d.Truncate (time.ParseDuration "15m") }}</p>
<p>{{ $d.Truncate (time.ParseDuration "3m") }}</p>
<p>{{ $d.Truncate (time.ParseDuration "4s") }}</p>
<p>零倍数：{{ $d.Truncate (time.ParseDuration "0s") }}</p>
<p>负倍数：{{ $d.Truncate (time.ParseDuration "-2h") }}</p>
<p>负时长：{{ $n.Truncate (time.ParseDuration "1h") }}</p>
```

Hugo 渲染为：

```html
<p>2h0m0s</p>
<p>3h30m0s</p>
<p>3h30m0s</p>
<p>3h32m28s</p>
<p>零倍数：3h32m31.5s</p>
<p>负倍数：3h32m31.5s</p>
<p>负时长：-3h0m0s</p>
```

**你应当看到什么**：对 `2h` 截断得到 `2h0m0s`（零头 1h32m31.5s 被丢掉，而 `Round` 会进位到 `4h0m0s`）；对 `3m` 与 `15m` 恰好都得到 `3h30m0s`；倍数写 `0` 或负数时**原值返回、不报错**；负时长 `-3h30m` 对 `1h` 截断得到 `-3h0m0s`（向零方向）。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，单语言站点（`locale = 'en-US'`、`timeZone = 'UTC'`），Windows。

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| `3h32m31.5s` 对 `2h` | `2h0m0s` | 否 |
| `3h32m31.5s` 对 `15m` | `3h30m0s` | 否 |
| `3h32m31.5s` 对 `3m` | `3h30m0s` | 否 |
| `3h32m31.5s` 对 `4s` | `3h32m28s` | 否 |
| 倍数为 `0s` | 原值返回 `3h32m31.5s` | 否 |
| 倍数为负数（`-2h`） | 原值返回 `3h32m31.5s` | 否 |
| 负时长 `-3h30m` 对 `1h` | `-3h0m0s`（向零方向） | 否 |
| 参数写成字符串（`.Truncate "2h"`） | —— | 是：`expected integer; found "2h"` |
| 返回类型 | `time.Duration` | 否 |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 报错看不懂 | `expected integer; found "2h"` | 倍数写成了字符串 | 用 `time.ParseDuration "2h"` 包一层 |
| 没报错但结果不对 | 截断毫无效果 | 倍数是 `0s` 或负数（原值返回） | 检查倍数变量，必要时先打印出来 |
| 没报错但结果不对 | 结果比实际时长还大 | 用成了 [`Round`](/methods/duration/round/) | `Truncate` 向零截断，不会变大；核对调用的方法名 |
| 没报错但结果不对 | 负数时结果方向与预期相反 | `Truncate` 向零，`Round` 远离零 | 两个页面的实测表对照看 |
| 没报错但结果不对 | 截断后想拿数字，却显示 `2h0m0s` | `Truncate` 返回 `Duration` | 再接 `.Hours` / `.Seconds` |

更多排查入口见[故障排查](/troubleshooting/)。
