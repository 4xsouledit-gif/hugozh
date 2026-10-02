+++
title = "math.Div"
linkTitle = "math.Div"
description = "返回第一个数字除以一个或多个数字的结果。"
date = 2026-10-02
weight = 110
source = "https://gohugo.io/functions/math/div/"

[params.functions_and_methods]
signatures = ["math.Div VALUE VALUE..."]
returnType = "any"
aliases = ["div"]
+++

## 这一页解决什么问题

模板里没有 `/` 运算符，除法只能用 `div`（`math.Div` 的别名）。隐藏的坑在**类型**：两个整数相除会做整数除法（截断小数），只有出现浮点数才得到小数结果。

```go-html-template
{{ div 12 3 2 }} → 2
```

## 什么时候用，什么时候别用

**该用**：

- 计算平均值、单价、比例；
- 需要连续除以多个数（`div 12 3 2` = `12÷3÷2`）。

**别用**：

- 想得到小数结果而两边都是整数 → 至少把一个操作数写成浮点（`div 7.0 2`）；
- 想做取余 → 用 [`math.Mod`](/functions/math/mod/)；
- 想向上取整算页数 → 用 [`math.Ceil`](/functions/math/ceil/)，并注意 `div` 先截断的问题；
- 想格式化小数位 → 用 [`fmt.Printf`](/functions/fmt/printf/)。

如果其中一个数字是浮点数（`float`），结果为 `float`。

```go-html-template
{{ div 12 3 2 }} → 2
```

## 完整示例：整数除法与浮点除法的差别

```go-html-template {file="layouts/_partials/div-demo.html"}
{{ $sum := 350 }}{{ $count := 3 }}
<p>整数除法：{{ div $sum $count }}</p>
<p>浮点除法：{{ div $sum 3.0 }}</p>
<p>多参数连续除：{{ div 12 3 2 }}</p>
```

Hugo 0.167.0 实测渲染为：

```html
<p>整数除法：116</p>
<p>浮点除法：116.66666666666667</p>
<p>多参数连续除：2</p>
```

**你应当看到什么**：`350 ÷ 3` 在整数除法里得到 `116`（小数被截断，不是四舍五入）；把除数写成 `3.0` 就得到 `116.66666666666667`。**需要精确结果时，务必确认至少一个操作数是浮点**——这是模板里最常见的精度 bug。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，单语言站点，Windows。

| 输入 | 结果 | 是否报错 |
| --- | --- | --- |
| `12 3 2` | `2`（`int64`，左到右连续除） | 否 |
| `3 2` | `1`（整数除法截断，**不是 1.5**） | 否 |
| `350 3` | `116` | 否 |
| `350 3.0` | `116.66666666666667`（`float64`） | 否 |
| `7.0 2` | `3.5` | 否 |
| `1 0` | —— | 是：`error calling div: can't divide the value by 0` |
| 非数字字符串 | —— | 是：`can't apply the operator to the values`（与 [`math.Add`](/functions/math/add/) 同类） |
| 返回类型 | `any`：全整数为 `int64`，含浮点为 `float64` | 否 |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 没报错但结果不对 | 平均值少了小数（如 116 而不是 116.67） | 整数除法截断 | 至少一个操作数写浮点：`div $sum 3.0`，或先 [`cast.ToFloat`](/functions/cast/tofloat/) |
| 没报错但结果不对 | 分页数算少了一页 | 先用 `div` 截断，再 `Ceil` 也救不回来 | 用 `math.Ceil (div $total 3.0)` |
| 报错看不懂 | `can't divide the value by 0` | 除数为 0（常见于用 `len` 做除数而集合为空） | 先判断 `if gt (len $items) 0` |
| 报错看不懂 | `can't apply the operator to the values` | 有操作数是字符串 | 用 [`cast`](/functions/cast/) 转成数字 |

更多排查入口见[故障排查](/troubleshooting/)。
