+++
title = "math.ToDegrees"
linkTitle = "math.ToDegrees"
description = "返回把给定弧度值换算成的角度值。"
date = 2026-10-02
weight = 300
source = "https://gohugo.io/functions/math/todegrees/"

[params.functions_and_methods]
signatures = ["math.ToDegrees VALUE"]
returnType = "float64"
+++

## 这一页解决什么问题

三角函数（[`math.Sin`](/functions/math/sin/)、[`math.Cos`](/functions/math/cos/)、[`math.Tan`](/functions/math/tan/)、[`math.Asin`](/functions/math/asin/)、[`math.Acos`](/functions/math/acos/)、[`math.Atan`](/functions/math/atan/)、[`math.Atan2`](/functions/math/atan2/)）的输入输出**都是弧度**，而人类看的是角度。`math.ToDegrees` 负责这一步换算。

```go-html-template
{{ math.ToDegrees 1.5707963267948966 }} → 90
```

## 什么时候用，什么时候别用

**该用**：

- 把反三角函数的结果转成角度再显示；
- 与 [`math.ToRadians`](/functions/math/toradians/) 配对，在「角度输入 / 角度输出」的应用里做转换。

**别用**：

- 需要弧度输入 → 用 [`math.ToRadians`](/functions/math/toradians/)；
- 想保留固定小数位 → 输出后再用 [`fmt.Printf`](/functions/fmt/printf/) 格式化（本函数只做单位换算）；
- 想手写 `mul $x 180 | div …` → 直接用它，避免自己写错系数。

## 完整示例：反三角函数结果转角度

```go-html-template {file="layouts/_partials/todegrees-demo.html"}
<p>π/2 弧度 = {{ math.ToDegrees 1.5707963267948966 }} 度</p>
<p>acos(0.5) = {{ math.ToDegrees (math.Acos 0.5) }} 度</p>
```

Hugo 0.167.0 实测渲染为：

```html
<p>π/2 弧度 = 90 度</p>
<p>acos(0.5) = 59.99999999999999 度</p>
```

**你应当看到什么**：π/2 换成 `90`（整数）；`acos(0.5)` 应得 60°，实测 `59.99999999999999`——误差来自浮点，需要干净数值时套 [`math.Round`](/functions/math/round/)。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，单语言站点，Windows。

| 输入 | 结果 | 是否报错 |
| --- | --- | --- |
| `1.5707963267948966` | `90`（类型 `float64`） | 否 |
| `math.Acos 0.5`（约 1.0472） | `59.99999999999999` | 否 |
| `0` | `0` | 否 |
| `math.Pi` | `180` | 否 |
| 非数字字符串 `"x"` | 上游未说明；同类函数的报错见 [`math.Sqrt`](/functions/math/sqrt/) | 是 |
| 返回类型 | `float64` | 否 |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 没报错但结果不对 | 角度差一点点（59.9999…） | 浮点误差 | [`math.Round`](/functions/math/round/) 或 `printf "%.0f"` |
| 没报错但结果不对 | 页面显示的是弧度 | 忘了换算 | 套本函数 |
| 没报错但结果不对 | 小数位太多 | 未格式化 | 用 [`fmt.Printf`](/functions/fmt/printf/) |

更多排查入口见[故障排查](/troubleshooting/)。
