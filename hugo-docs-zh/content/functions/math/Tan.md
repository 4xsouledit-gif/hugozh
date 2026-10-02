+++
title = "math.Tan"
linkTitle = "math.Tan"
description = "返回给定弧度值的正切。"
date = 2026-10-02
weight = 290
source = "https://gohugo.io/functions/math/tan/"

[params.functions_and_methods]
signatures = ["math.Tan VALUE"]
returnType = "float64"
+++

## 这一页解决什么问题

已知角度求「对边 ÷ 邻边」的比值，或者反过来在斜率与角度之间换算。`math.Tan` 接收的**是弧度**。

```go-html-template
{{ math.Tan 1 }} → 1.557407724654902
```

## 什么时候用，什么时候别用

**该用**：

- 需要正切值（斜率、倾斜、投影）；
- 与 [`math.ToRadians`](/functions/math/toradians/) 配合处理角度。

**别用**：

- 已知斜率求角度 → 用 [`math.Atan`](/functions/math/atan/)；
- 要正弦/余弦 → 用 [`math.Sin`](/functions/math/sin/)、[`math.Cos`](/functions/math/cos/)；
- 在 90° 附近做计算 → 正切值会急剧增大甚至趋于无穷，浮点结果不可靠。

## 完整示例：45° 与 1 弧度

```go-html-template {file="layouts/_partials/tan-demo.html"}
<p>tan(45°) = {{ math.Tan (math.ToRadians 45) }}</p>
<p>tan(1 弧度) = {{ math.Tan 1 }}</p>
```

Hugo 0.167.0 实测渲染为：

```html
<p>tan(45°) = 1</p>
<p>tan(1 弧度) = 1.557407724654902</p>
```

**你应当看到什么**：`tan(45°)` 数学上等于 1，实测也输出 `1`（本例没有出现可观察的浮点尾数，但这属于运气，不要据此用 `eq` 判断其它角度的结果）。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，单语言站点，Windows。

| 输入 | 结果 | 是否报错 |
| --- | --- | --- |
| `1`（弧度） | `1.557407724654902` | 否 |
| `math.ToRadians 45` | `1` | 否 |
| `0` | `0` | 否 |
| 接近 π/2 的值 | 结果绝对值急剧增大（浮点近似，不是真正的无穷） | 否 |
| 非数字字符串 `"x"` | 上游未说明；同类三角函数的报错见 [`math.Sqrt`](/functions/math/sqrt/) | 是 |
| 返回类型 | `float64` | 否 |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 没报错但结果不对 | 用 45 当参数，结果不是 1 | 参数单位是弧度 | 套 [`math.ToRadians`](/functions/math/toradians/) |
| 没报错但结果不对 | 90° 附近结果异常巨大 | 正切在 π/2 处无定义 | 规避该角度，或用余切/其它表达方式 |
| 报错看不懂 | 报错提到非数字 | 传入了字符串 | 用 [`cast.ToFloat`](/functions/cast/tofloat/) 转换 |

更多排查入口见[故障排查](/troubleshooting/)。
