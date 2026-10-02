+++
title = "math.Mul"
linkTitle = "math.Mul"
description = "返回第一个数字与一个或多个数字相乘的结果。"
date = 2026-10-02
weight = 190
source = "https://gohugo.io/functions/math/mul/"

[params.functions_and_methods]
signatures = ["math.Mul VALUE VALUE..."]
returnType = "any"
aliases = ["mul"]
+++

## 这一页解决什么问题

模板里没有 `*` 运算符：单价 × 数量、宽 × 高、按比例换算，都要用 `mul`（`math.Mul` 的别名）。它还能连续乘多个数，很适合「小计 × 折扣」这类链式计算。

```go-html-template
{{ mul 12 3 2 }} → 72
```

## 什么时候用，什么时候别用

**该用**：

- 价格、面积、比例换算等乘法；
- 连续相乘：`mul $price $qty $discount`。

**别用**：

- 求和 → 用 [`math.Sum`](/functions/math/sum/)（或 [`math.Add`](/functions/math/add/)）；
- 求一组数的积 → 用 [`math.Product`](/functions/math/product/)（可以直接吃切片）；
- 需要精确的货币计算 → 浮点乘法会有误差（实测 `mul 19.9 3` 得到 `59.699999999999996`），显示前应 [`math.Round`](/functions/math/round/) 或 `printf "%.2f"`。

如果其中一个数字是浮点数（`float`），结果为 `float`。

```go-html-template
{{ mul 12 3 2 }} → 72
```

## 完整示例：小计与折后价

```go-html-template {file="layouts/_partials/mul-demo.html"}
{{ $price := 19.9 }}{{ $qty := 3 }}{{ $discount := 0.9 }}
<p>小计：{{ mul $price $qty }}</p>
<p>折后：{{ mul $price $qty $discount }}</p>
<p>整数相乘：{{ mul 12 3 2 }}（类型 {{ printf "%T" (mul 12 3 2) }}）</p>
```

Hugo 0.167.0 实测渲染为：

```html
<p>小计：59.699999999999996</p>
<p>折后：53.73</p>
<p>整数相乘：72（类型 int64）</p>
```

**你应当看到什么**：`19.9 × 3` 打印成 `59.699999999999996`——这是 IEEE 754 浮点的正常表现，**不是 Hugo 的 bug**。面向读者的价格必须格式化（`printf "%.2f"`），或者先把金额换成「分」用整数运算。第三行说明全整数相乘返回 `int64`。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，单语言站点，Windows。

| 输入 | 结果 | 是否报错 |
| --- | --- | --- |
| `12 3 2` | `72`（类型 `int64`） | 否 |
| `12 3.5` | `42`（类型 `float64`） | 否 |
| `19.9 3` | `59.699999999999996`（浮点误差） | 否 |
| `19.9 3 0.9` | `53.73` | 否 |
| 非数字字符串 | —— | 是：`can't apply the operator to the values`（与 [`math.Add`](/functions/math/add/) 同类） |
| 只传一个参数 | —— | 是：至少需要两个数字（同 [`math.Add`](/functions/math/add/)） |
| 返回类型 | `any`：全整数为 `int64`，含浮点为 `float64` | 否 |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 没报错但结果不对 | 价格出现 `59.699999999999996` | 浮点表示误差 | `printf "%.2f"`，或改用整数（分）计算 |
| 没报错但结果不对 | 结果是整数，丢了小数 | 两个操作数都是整数 | 至少写一个浮点数 |
| 报错看不懂 | `can't apply the operator to the values` | 有操作数是字符串 | 用 [`cast.ToFloat`](/functions/cast/tofloat/) 转换 |
| 报错看不懂 | 提示至少需要两个数字 | 只传了一个参数 | 补足两个以上 |

更多排查入口见[故障排查](/troubleshooting/)。
