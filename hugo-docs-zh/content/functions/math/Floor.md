+++
title = "math.Floor"
linkTitle = "math.Floor"
description = "返回小于或等于给定数字的最大整数值。"
date = 2026-10-02
weight = 120
source = "https://gohugo.io/functions/math/floor/"

[params.functions_and_methods]
signatures = ["math.Floor VALUE"]
returnType = "float64"
+++

## 这一页解决什么问题

「7 条数据、每页 3 条，能装满几页？」答案是 2——剩下 1 条装不满一页。`math.Floor`（向下取整）回答的是「不超过原值的最大整数」，用来算**完整份数**、**已满页数**、**能整除的次数**。

```go-html-template
{{ math.Floor 1.9 }} → 1
```

## 什么时候用，什么时候别用

**该用**：

- 计算「装满了多少份」，不足一份的舍去；
- 需要「不大于原值的最大整数」。

**别用**：

- 要「不足一份也算一份」（如分页总数）→ 用 [`math.Ceil`](/functions/math/ceil/)；
- 要四舍五入 → 用 [`math.Round`](/functions/math/round/)；
- 想保留小数位 → 用 [`fmt.Printf`](/functions/fmt/printf/)。

## 完整示例：算已满页数与剩余

```go-html-template {file="layouts/_partials/floor-demo.html"}
<p>完整页数：{{ math.Floor (div 7.0 3) }} 页（类型 {{ printf "%T" (math.Floor (div 7.0 3)) }}）</p>
<p>floor(1.9) = {{ math.Floor 1.9 }}；floor(-1.9) = {{ math.Floor -1.9 }}</p>
```

Hugo 0.167.0 实测渲染为：

```html
<p>完整页数：2 页（类型 float64）</p>
<p>floor(1.9) = 1；floor(-1.9) = -2</p>
```

**你应当看到什么**：`7 ÷ 3 = 2.333…` 向下取整得到 `2`，正好是「装满的页数」；`-1.9` 的结果是 `-2`（向数轴**负方向**取整，不是往零取整）。返回值是 `float64`。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，单语言站点，Windows。

| 输入 | 结果 | 是否报错 |
| --- | --- | --- |
| `1.9` | `1`（类型 `float64`） | 否 |
| `-1.9` | `-2` | 否 |
| `div 7.0 3`（`2.333…`） | `2` | 否 |
| `nil` | `0`（实测，宽松处理；不建议依赖） | 否 |
| 切片等非数字值 | —— | 是：`Floor operator can't be used with non-float value`（与 [`math.Ceil`](/functions/math/ceil/) 同类） |
| 返回类型 | `float64` | 否 |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 没报错但结果不对 | 分成 2 份却漏掉了剩下的条目 | `Floor` 只给完整份数 | 需要「多一份也要算」时用 [`math.Ceil`](/functions/math/ceil/) |
| 没报错但结果不对 | 负数结果比预期小 | `Floor` 向负方向取整 | 想「往零取整」用 [`math.Round`](/functions/math/round/) 或 [`cast.ToInt`](/functions/cast/toint/) |
| 没报错但结果不对 | 页面上显示 `2` 但不能当整数用 | 返回 `float64` | 需要整数时套 [`cast.ToInt`](/functions/cast/toint/) |

更多排查入口见[故障排查](/troubleshooting/)。
