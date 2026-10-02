+++
title = "math.ToRadians"
linkTitle = "math.ToRadians"
description = "返回把给定角度值换算成的弧度值。"
date = 2026-10-02
weight = 310
source = "https://gohugo.io/functions/math/toradians/"

[params.functions_and_methods]
signatures = ["math.ToRadians VALUE"]
returnType = "float64"
+++

## 这一页解决什么问题

三角函数只接受**弧度**。你在内容里写的是 `60°`、`45°` 这类人话，直接喂给 [`math.Cos`](/functions/math/cos/) 会得到错误结果（而且**不报错**）。`math.ToRadians` 就是那个必须补上的换算步骤。

```go-html-template
{{ math.ToRadians 90 }} → 1.5707963267948966
```

## 什么时候用，什么时候别用

**该用**：

- 把人类可读的角度交给任何三角函数之前；
- 与 [`math.ToDegrees`](/functions/math/todegrees/) 配对做双向换算。

**别用**：

- 需要角度输出 → 用 [`math.ToDegrees`](/functions/math/todegrees/)；
- 想自己乘 π/180 → 直接用本函数，省得写错系数（并且它和 [`math.Pi`](/functions/math/pi/) 的精度一致）。

## 完整示例：角度进、三角函数出

```go-html-template {file="layouts/_partials/toradians-demo.html"}
<p>90° = {{ math.ToRadians 90 }} 弧度</p>
<p>cos(60°) = {{ math.Cos (math.ToRadians 60) }}</p>
```

Hugo 0.167.0 实测渲染为：

```html
<p>90° = 1.5707963267948966 弧度</p>
<p>cos(60°) = 0.5000000000000001</p>
```

**你应当看到什么**：`90°` 换成 π/2；`cos(60°)` 得到 `0.5000000000000001`（浮点误差，不是 `0.5`）。**换算与三角函数要成对出现**——只写 `math.Cos 60` 会得到一个毫无意义的数，且不会有任何报错提示你。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，单语言站点，Windows。

| 输入 | 结果 | 是否报错 |
| --- | --- | --- |
| `90` | `1.5707963267948966`（类型 `float64`） | 否 |
| `60` | `1.0471975511965976`（`math.Cos` 该值得到 `0.5000000000000001`） | 否 |
| `0` | `0` | 否 |
| `180` | `3.141592653589793` | 否 |
| 非数字字符串 `"x"` | 上游未说明；同类函数的报错见 [`math.Sqrt`](/functions/math/sqrt/) | 是 |
| 返回类型 | `float64` | 否 |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 没报错但结果不对 | `math.Cos 60` 的结果毫无意义 | 直接用了角度 | 套本函数：`math.Cos (math.ToRadians 60)` |
| 没报错但结果不对 | 期望 0.5 得到 0.5000000000000001 | 浮点误差 | 容差比较或 `printf "%.1f"` |
| 没报错但结果不对 | 想把结果再当角度用 | 单位已经变成弧度 | 用 [`math.ToDegrees`](/functions/math/todegrees/) 换回来 |

更多排查入口见[故障排查](/troubleshooting/)。
