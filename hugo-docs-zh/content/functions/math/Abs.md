+++
title = "math.Abs"
linkTitle = "math.Abs"
description = "返回给定数字的绝对值。"
date = 2026-10-02
weight = 20
source = "https://gohugo.io/functions/math/abs/"

[params.functions_and_methods]
signatures = ["math.Abs VALUE"]
returnType = "float64"
+++

## 这一页解决什么问题

要算「两个数差多少」而不关心谁大谁小：库存与目标的偏差、两个尺寸的距离、评分与基准的差距。模板里没有取绝对值的运算符，直接 `sub` 会得到负数，于是需要 `math.Abs` 把符号去掉。

```go-html-template
{{ math.Abs -2.1 }} → 2.1
```

## 什么时候用，什么时候别用

**该用**：

- 只关心差值大小，不关心方向（偏差、距离、容差比较）；
- 需要把负数转成正数再参与后续运算。

**别用**：

- 需要保留方向（谁比谁大）→ 直接用 [`math.Sub`](/functions/math/sub/)；
- 目的只是「去掉小数」→ 用 [`math.Floor`](/functions/math/floor/)、[`math.Ceil`](/functions/math/ceil/)、[`math.Round`](/functions/math/round/)；`math.Abs` 只处理符号，不做取整；
- 想比较两个数的大小 → 用 [`compare`](/functions/compare/) 系列（`lt`、`gt`），不必先取绝对值；
- 想格式化小数位 → 用 [`fmt.Printf`](/functions/fmt/printf/)。

## 完整示例：算两个数的绝对差

```go-html-template {file="layouts/_partials/gap.html"}
{{ $a := 12 }}
{{ $b := 30 }}
<p>差值（带符号）：{{ sub $a $b }}</p>
<p>绝对差：{{ math.Abs (sub $a $b) }}（类型 {{ printf "%T" (math.Abs (sub $a $b)) }}）</p>
```

Hugo 0.167.0 实测渲染为：

```html
<p>差值（带符号）：-18</p>
<p>绝对差：18（类型 float64）</p>
```

**你应当看到什么**：`sub 12 30` 得到 `-18`，套一层 `math.Abs` 后变成 `18`。注意返回类型是 `float64`（即使输入都是整数），而 `sub` 返回的是 `int64`——把 `math.Abs` 的结果再交给要求整数的场合时要留意这一点。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，单语言站点，Windows。

| 输入 | 结果 | 是否报错 |
| --- | --- | --- |
| `-2.1` | `2.1` | 否 |
| `-5`（整数） | `5`（类型 `float64`） | 否 |
| `18`（正数） | `18` | 否 |
| 布尔 `true` | `1`（实测，宽松转换） | 否 |
| 非数字字符串 `"x"` | —— | 是：`error calling Abs: the math.Abs function requires a numeric argument` |
| 不传参数 | —— | 是：`wrong number of args for Abs: want 1 got 0` |
| 返回类型 | `float64`（即使输入是整数） | 否 |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 报错看不懂 | `the math.Abs function requires a numeric argument` | 传了非数字字符串（常见于把参数当数字用） | 用 [`cast`](/functions/cast/) 转换或核对参数类型 |
| 没报错但结果不对 | 后续按整数处理的逻辑出错 | `math.Abs` 返回 `float64`，不是 `int64` | 需要整数时外面套 [`math.Round`](/functions/math/round/) 或 [`cast.ToInt`](/functions/cast/toint/) |
| 没报错但结果不对 | 期望得到整数，结果打印 `5` 之类没问题但类型不对 | 同上 | 同上 |

更多排查入口见[故障排查](/troubleshooting/)。
