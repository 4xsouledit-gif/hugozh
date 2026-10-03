+++
title = "math.Ceil"
linkTitle = "math.Ceil"
description = "返回大于或等于给定数字的最小整数值。"
date = 2026-10-02
weight = 80
source = "https://gohugo.io/functions/math/ceil/"

[params.functions_and_methods]
signatures = ["math.Ceil VALUE"]
returnType = "float64"
+++

## 这一页解决什么问题

「7 条数据、每页 3 条，需要几页？」答案是 3——`7/3 = 2.33`，必须**向上**取整，否则最后一页会被吞掉。这就是 `math.Ceil`（向上取整）的典型用途：分页数、需要的容器数、按块分配的数量。

```go-html-template
{{ math.Ceil 2.1 }} → 3
```

## 什么时候用，什么时候别用

**该用**：

- 分页/分组：任何「装不下就要多一个」的计算；
- 需要「不小于原值的最小整数」。

**别用**：

- 想要「不超过原值的最大整数」→ 用 [`math.Floor`](/functions/math/floor/)；
- 想要「四舍五入」→ 用 [`math.Round`](/functions/math/round/)；
- 想保留小数位 → 用 [`fmt.Printf`](/functions/fmt/printf/) 的 `%.2f`，取整函数会把小数丢掉。

## 完整示例：算分页数

```go-html-template {file="layouts/_partials/pager-count.html"}
<p>每页 3 条、共 7 条，需要 {{ math.Ceil (div 7.0 3) }} 页（类型 {{ printf "%T" (math.Ceil (div 7.0 3)) }}）</p>
<p>ceil(2.1) = {{ math.Ceil 2.1 }}；ceil(-2.1) = {{ math.Ceil -2.1 }}</p>
```

Hugo 0.167.0 实测渲染为：

```html
<p>每页 3 条、共 7 条，需要 3 页（类型 float64）</p>
<p>ceil(2.1) = 3；ceil(-2.1) = -2</p>
```

**你应当看到什么**：`div 7.0 3` 得到 `2.3333…`，向上取整为 `3`。注意两件事：**一是**必须写成 `7.0`（浮点），否则 `div 7 3` 会先做整数除法得到 `3`，再取整还是 `3`，看起来凑巧正确却经不起换数字（例如 8 条 `div 8 3` = `2`，取整仍是 `2`，就少了一页）；**二是**返回类型是 `float64`，页面显示 `3` 但类型不是整数，参与后续整数运算前要留意。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，单语言站点，Windows。

| 输入 | 结果 | 是否报错 |
| --- | --- | --- |
| `2.1` | `3`（类型 `float64`） | 否 |
| `-2.1` | `-2`（向数轴正方向取整） | 否 |
| 整数（如 `7`） | 返回该整数本身 | 否 |
| `div 7.0 3`（`2.333…`） | `3` | 否 |
| 切片（如 `slice 1 2`） | —— | 是：`error calling Ceil: Ceil operator can't be used with non-float value` |
| 返回类型 | `float64` | 否 |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 没报错但结果不对 | 分页数少一页 | 先做了整数除法，小数部分已被丢掉 | 至少一个操作数写浮点：`div $total 3.0` |
| 报错看不懂 | `Ceil operator can't be used with non-float value` | 传了切片、映射等非数字值 | 传单个数字；要处理切片用 [`math.Sum`](/functions/math/sum/) 之类先聚合 |
| 没报错但结果不对 | 页面上显示 `3` 但不能当整数用 | 返回 `float64` | 需要整数时套 [`cast.ToInt`](/functions/cast/toint/) 或 [`math.Round`](/functions/math/round/) |

更多排查入口见[故障排查](/troubleshooting/)。
