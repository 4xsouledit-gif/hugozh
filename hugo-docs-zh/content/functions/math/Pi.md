+++
title = "math.Pi"
linkTitle = "math.Pi"
description = "返回数学常量 pi。"
date = 2026-10-02
weight = 200
source = "https://gohugo.io/functions/math/pi/"

[params.functions_and_methods]
signatures = ["math.Pi"]
returnType = "float64"
+++

## 这一页解决什么问题

圆周长、圆面积、扇形、弧度换算里都要用到 π。模板里没有现成常量，`math.Pi` 给出 `float64` 精度的 π 值。

```go-html-template
{{ math.Pi }} → 3.141592653589793
```

## 什么时候用，什么时候别用

**该用**：

- 圆的周长/面积、角度转弧度时的系数；
- 需要把 π 参与运算（通常与 [`math.Mul`](/functions/math/mul/) 连用）。

**别用**：

- 角度与弧度互转 → 直接用 [`math.ToRadians`](/functions/math/toradians/)、[`math.ToDegrees`](/functions/math/todegrees/)，它们内部就是乘以/除以 π 的换算，不用自己写；
- 只想输出 π 的近似文本 → 直接写字面量即可。

## 完整示例：算圆面积

```go-html-template {file="layouts/_partials/pi-demo.html"}
<p>π = {{ math.Pi }}</p>
<p>半径 2 的圆面积 = {{ mul math.Pi (mul 2 2) }}</p>
```

Hugo 0.167.0 实测渲染为：

```html
<p>π = 3.141592653589793</p>
<p>半径 2 的圆面积 = 12.566370614359172</p>
```

**你应当看到什么**：`π × r²` = `π × 4` = `12.566370614359172`，类型 `float64`。需要按位显示时用 [`fmt.Printf`](/functions/fmt/printf/)（例如 `printf "%.2f"`）。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，单语言站点，Windows。

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| 直接输出 | `3.141592653589793` | 否 |
| 参与乘法 | `mul math.Pi (mul 2 2)` = `12.566370614359172` | 否 |
| 传入参数 | 该函数无参数；传参会导致参数个数错误 | 是 |
| 返回类型 | `float64` | 否 |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 没报错但结果不对 | 面积小数位太长 | 浮点结果未格式化 | 用 `printf "%.2f"` |
| 没报错但结果不对 | 角度换算结果不对 | 用 π 手算时写错了分子分母 | 直接用 [`math.ToRadians`](/functions/math/toradians/)／[`math.ToDegrees`](/functions/math/todegrees/) |
| 报错看不懂 | 参数个数错误 | 给 `math.Pi` 传了参数 | 它不接受参数，写成 `{{ math.Pi }}` |

更多排查入口见[故障排查](/troubleshooting/)。
