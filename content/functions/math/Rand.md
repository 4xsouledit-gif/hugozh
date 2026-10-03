+++
title = "math.Rand"
linkTitle = "math.Rand"
description = "返回半开区间 [0.0, 1.0) 内的伪随机数。"
date = 2026-10-02
weight = 230
source = "https://gohugo.io/functions/math/rand/"

[params.functions_and_methods]
signatures = ["math.Rand"]
returnType = "float64"
+++

## 这一页解决什么问题

需要一个随机值：随机背景图、随机推荐语、随机排序种子。`math.Rand` 给出 `[0.0, 1.0)` 区间内的伪随机浮点数——**每次构建都会不同**，这一点既是它的用途，也是它最大的限制。

```go-html-template
{{ math.Rand }} → 0.6312770459590062
```

> [!NOTE]
> 上游示例给出的是一次数值结果。实测每次构建都不同（本页实测一次得到 `0.02935732464927165`），**不要**把某个具体数值写进测试断言。

## 什么时候用，什么时候别用

**该用**：

- 每次构建都要变化的展示型随机（随机推荐、随机配色）；
- 需要一个 `[0,1)` 的基准值再自行缩放（配合 [`math.Mul`](/functions/math/mul/)、[`math.Floor`](/functions/math/floor/)、[`math.Ceil`](/functions/math/ceil/)）。

**别用**：

- 需要**可复现**的输出 → 随机值会让每次构建的产物都不同，缓存、diff、快照测试都会失效；
- 需要密码学安全的随机（令牌、密钥）→ 该函数是伪随机，不适用于安全场景；
- 需要给页面分配稳定 id → 用 [`math.Counter`](/functions/math/counter/) 也不行（受并发影响），应当用稳定的业务字段。

## 完整示例：随机数与随机整数

```go-html-template {file="layouts/_partials/rand-demo.html"}
<p>随机数：{{ math.Rand }}；0–5 的整数：{{ math.Rand | mul 6 | math.Floor }}</p>
```

Hugo 0.167.0 实测渲染为（数值每次都不同）：

```html
<p>随机数：0.02935732464927165；0–5 的整数：4</p>
```

**你应当看到什么**：两次调用会得到不同的随机值（第一个是 `[0,1)` 的浮点，第二个是 `0`–`5` 的整数）。上游给出了一组常用配方，注意**取整函数的选择决定了区间**：

```go-html-template
{{ math.Rand | mul 6 | math.Floor }}
{{ math.Rand | mul 6 | math.Ceil }}
{{ div (math.Rand | mul 50 | math.Floor) 10 }}
{{ div (math.Rand | mul 50 | math.Ceil) 10 }}
```

- `[0, 5]` 的随机整数：`math.Rand | mul 6 | math.Floor`；
- `[1, 6]` 的随机整数：`math.Rand | mul 6 | math.Ceil`；
- `[0, 4.9]`、小数点后一位：`div (math.Rand | mul 50 | math.Floor) 10`；
- `[0.1, 5.0]`、小数点后一位：`div (math.Rand | mul 50 | math.Ceil) 10`。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，单语言站点，Windows。

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| 直接输出 | `[0.0, 1.0)` 内的浮点数，实测一次为 `0.02935732464927165` | 否 |
| 同一模板里多次调用 | 每次得到不同的值 | 否 |
| 不同构建之间 | 值不同（**产物不可复现**） | 否 |
| `math.Rand \| mul 6 \| math.Floor` | `0`–`5` 的整数，实测一次为 `4` | 否 |
| 传入参数 | 该函数无参数；传参会导致参数个数错误 | 是 |
| 返回类型 | `float64` | 否 |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 没报错但结果不对 | 每次构建产物都不同，`git diff` 一片红 | 随机值进入输出 | 只在展示型内容里用；需要稳定输出时改用确定性的数据源 |
| 没报错但结果不对 | 随机整数的范围与预期差 1 | 取整函数决定了区间：`Floor` 对应 `[0, 5]`，`Ceil` 对应 `[1, 6]`（上游说明） | 按需要的区间选 `Floor` 或 `Ceil` |
| 没报错但结果不对 | 随机小数位数太多 | 浮点结果未格式化 | 用 `printf "%.1f"` 控制显示 |
| 报错看不懂 | 参数个数错误 | 给 `math.Rand` 传了参数 | 它不接受参数，写成 `{{ math.Rand }}` |

更多排查入口见[故障排查](/troubleshooting/)。
