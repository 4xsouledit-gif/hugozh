+++
title = "math.Sin"
linkTitle = "math.Sin"
description = "返回给定弧度值的正弦。"
date = 2026-10-02
weight = 250
source = "https://gohugo.io/functions/math/sin/"

[params.functions_and_methods]
signatures = ["math.Sin VALUE"]
returnType = "float64"
+++

## 这一页解决什么问题

做波形、旋转、圆弧计算时需要正弦值。与 [`math.Cos`](/functions/math/cos/) 一样，**参数单位是弧度**：想算 `sin(30°)` 必须先 [`math.ToRadians 30`](/functions/math/toradians/)。

```go-html-template
{{ math.Sin 1 }} → 0.8414709848078965
```

## 什么时候用，什么时候别用

**该用**：

- 图形/几何/动画类计算里的正弦；
- 与 [`math.ToRadians`](/functions/math/toradians/) 配合处理手写的角度值。

**别用**：

- 直接拿角度调用 → 结果必然不对；
- 要余弦/正切 → 用 [`math.Cos`](/functions/math/cos/)、[`math.Tan`](/functions/math/tan/)；
- 想比较浮点结果是否相等 → 用容差，不要用 `eq`（见下文）。

## 完整示例：角度与弧度两种写法

```go-html-template {file="layouts/_partials/sin-demo.html"}
<p>sin(30°) = {{ math.Sin (math.ToRadians 30) }}</p>
<p>sin(1 弧度) = {{ math.Sin 1 }}</p>
```

Hugo 0.167.0 实测渲染为：

```html
<p>sin(30°) = 0.49999999999999994</p>
<p>sin(1 弧度) = 0.8414709848078965</p>
```

**你应当看到什么**：`sin(30°)` 数学上是 `0.5`，实测 `0.49999999999999994`。**这不是显示问题，是浮点本身的误差**：`{{ eq (math.Sin (math.ToRadians 30)) 0.5 }}` 会是 `false`。需要比较时用容差，例如 `lt (math.Abs (sub $v 0.5)) 1e-9`。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，单语言站点，Windows。

| 输入 | 结果 | 是否报错 |
| --- | --- | --- |
| `1`（弧度） | `0.8414709848078965` | 否 |
| `math.ToRadians 30` | `0.49999999999999994` | 否 |
| `0` | `0` | 否 |
| 非数字字符串 `"x"` | 上游未说明；同类三角函数的报错见 [`math.Sqrt`](/functions/math/sqrt/) | 是 |
| 返回类型 | `float64`（范围 `[-1, 1]`） | 否 |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 没报错但结果不对 | 用 30 当参数，结果不是 0.5 | 参数单位是弧度 | 套 [`math.ToRadians`](/functions/math/toradians/) |
| 没报错但结果不对 | `eq` 比较 0.5 得到 `false` | 浮点误差（实测 `0.49999999999999994`） | 用容差比较或 `printf "%.1f"` 后比字符串 |
| 报错看不懂 | 报错提到非数字 | 传入了字符串 | 用 [`cast.ToFloat`](/functions/cast/tofloat/) 转换 |

更多排查入口见[故障排查](/troubleshooting/)。
