+++
title = "math.Pow"
linkTitle = "math.Pow"
description = "返回第一个数字的第二个数字次幂。"
date = 2026-10-02
weight = 210
source = "https://gohugo.io/functions/math/pow/"

[params.functions_and_methods]
signatures = ["math.Pow VALUE1 VALUE2"]
returnType = "float64"
aliases = ["pow"]
+++

## 这一页解决什么问题

需要幂运算：2 的 10 次方、按 1.05 的复利增长、开平方（指数 0.5）。模板里没有 `**` 运算符，用 `pow`（`math.Pow` 的别名）。

```go-html-template
{{ math.Pow 2 3 }} → 8
```

## 什么时候用，什么时候别用

**该用**：

- 整数次幂、分数次幂（`0.5` 即开平方）；
- 指数增长/衰减的计算。

**别用**：

- 只想开平方 → 用 [`math.Sqrt`](/functions/math/sqrt/)，可读性更好；
- 想取对数 → 用 [`math.Log`](/functions/math/log/)；
- 想按固定倍数连乘有限个因子 → 用 [`math.Mul`](/functions/math/mul/) 或 [`math.Product`](/functions/math/product/)。

## 完整示例：整数次幂、负指数与开方

```go-html-template {file="layouts/_partials/pow-demo.html"}
<p>2^10 = {{ math.Pow 2 10 }}</p>
<p>2^-1 = {{ math.Pow 2 -1 }}</p>
<p>4^0.5 = {{ math.Pow 4 0.5 }}</p>
```

Hugo 0.167.0 实测渲染为：

```html
<p>2^10 = 1024</p>
<p>2^-1 = 0.5</p>
<p>4^0.5 = 2</p>
```

**你应当看到什么**：负指数得到倒数（`2^-1 = 0.5`），分数指数得到开方（`4^0.5 = 2`）。返回类型固定为 `float64`——即使结果是整数，也会是浮点类型（`1024` 打印时不带 `.0`，容易看错）。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，单语言站点，Windows。

| 输入 | 结果 | 是否报错 |
| --- | --- | --- |
| `2 3` | `8`（类型 `float64`） | 否 |
| `2 10` | `1024` | 否 |
| `2 -1` | `0.5` | 否 |
| `4 0.5` | `2` | 否 |
| `2 "3"`（数字字符串） | `8`（实测，宽松转换） | 否 |
| 非数字字符串 | 上游未说明；同类函数的报错见 [`math.Sqrt`](/functions/math/sqrt/) | 是 |
| 返回类型 | `float64` | 否 |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 没报错但结果不对 | 结果被判为「不是整数」 | 返回类型是 `float64` | 需要整数时套 [`cast.ToInt`](/functions/cast/toint/) |
| 没报错但结果不对 | 负数开偶次方得到 `NaN` | 数学上无实数解 | 先判断符号，给兜底值 |
| 报错看不懂 | 报错提到非数字 | 传入了非数字字符串 | 用 [`cast.ToFloat`](/functions/cast/tofloat/) 转换 |

更多排查入口见[故障排查](/troubleshooting/)。
