+++
title = "math.Cos"
linkTitle = "math.Cos"
description = "返回给定弧度值的余弦。"
date = 2026-10-02
weight = 90
source = "https://gohugo.io/functions/math/cos/"

[params.functions_and_methods]
signatures = ["math.Cos VALUE"]
returnType = "float64"
+++

## 这一页解决什么问题

做旋转、波形、圆弧一类计算时需要余弦值。`math.Cos` 接收的**是弧度不是角度**——这是最容易踩的一点：想算 `cos(60°)`，必须先 [`math.ToRadians 60`](/functions/math/toradians/)。

```go-html-template
{{ math.Cos 1 }} → 0.5403023058681398
```

## 什么时候用，什么时候别用

**该用**：

- 图形/几何计算里的余弦；
- 与 [`math.ToRadians`](/functions/math/toradians/) 配合把手写的角度转换成弧度。

**别用**：

- 直接拿角度调用 → 结果一定不对；先 `math.ToRadians`；
- 要正弦/正切 → 用 [`math.Sin`](/functions/math/sin/)、[`math.Tan`](/functions/math/tan/)；
- 只是想取小数点后几位 → 用 [`fmt.Printf`](/functions/fmt/printf/)。

## 完整示例：弧度与角度两种写法

```go-html-template {file="layouts/_partials/cos-demo.html"}
<p>cos(1 弧度) = {{ math.Cos 1 }}</p>
<p>cos(60°) = {{ math.Cos (math.ToRadians 60) }}</p>
```

Hugo 0.167.0 实测渲染为：

```html
<p>cos(1 弧度) = 0.5403023058681398</p>
<p>cos(60°) = 0.5000000000000001</p>
```

**你应当看到什么**：`cos(60°)` 数学上是 `0.5`，实测输出 `0.5000000000000001`——浮点误差，**不要**写 `eq` 判断相等，要比较就用容差（例如两者之差取 [`math.Abs`](/functions/math/abs/) 后小于 `1e-9`）。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，单语言站点，Windows。

| 输入 | 结果 | 是否报错 |
| --- | --- | --- |
| `1`（弧度） | `0.5403023058681398` | 否 |
| `math.ToRadians 60`（约 1.0472 弧度） | `0.5000000000000001` | 否 |
| `0` | `1` | 否 |
| 非数字字符串 `"x"` | 上游未说明；同类三角函数的报错见 [`math.Sqrt`](/functions/math/sqrt/) | 是 |
| 返回类型 | `float64` | 否 |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 没报错但结果不对 | 用 60 当参数，结果不是 0.5 | 参数单位是弧度，不是角度 | 套 [`math.ToRadians`](/functions/math/toradians/) |
| 没报错但结果不对 | 期望 0.5 得到 0.5000000000000001，`eq 0.5` 为假 | 浮点误差 | 用容差比较，或 `printf "%.1f"` 后比字符串 |
| 报错看不懂 | 报错提到非数字 | 传入了字符串 | 用 [`cast.ToFloat`](/functions/cast/tofloat/) 转换 |

更多排查入口见[故障排查](/troubleshooting/)。
