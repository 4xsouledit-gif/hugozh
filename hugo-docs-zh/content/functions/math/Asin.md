+++
title = "math.Asin"
linkTitle = "math.Asin"
description = "返回给定数字的反正弦值，以弧度为单位。"
date = 2026-10-02
weight = 50
source = "https://gohugo.io/functions/math/asin/"

[params.functions_and_methods]
signatures = ["math.Asin VALUE"]
returnType = "float64"
+++

## 这一页解决什么问题

已知正弦值求角度：给定「对边 ÷ 斜边」，反推出夹角。`math.Asin` 就是它，**单位是弧度**。

```go-html-template
{{ math.Asin 1 }} → 1.5707963267948966
```

## 什么时候用，什么时候别用

**该用**：

- 已知正弦值求角度（几何计算）；
- 与 [`math.ToDegrees`](/functions/math/todegrees/) 配合得到人类可读的角度。

**别用**：

- 已知正切（或需要按象限判断方向）→ 用 [`math.Atan`](/functions/math/atan/)／[`math.Atan2`](/functions/math/atan2/)；
- 已知余弦 → 用 [`math.Acos`](/functions/math/acos/)；
- 想把角度转成弧度 → 用 [`math.ToRadians`](/functions/math/toradians/)。

## 完整示例：由正弦值求角度

```go-html-template {file="layouts/_partials/asin-demo.html"}
<p>asin(1) = {{ math.Asin 1 }} 弧度</p>
<p>asin(0.5) = {{ math.ToDegrees (math.Asin 0.5) }} 度</p>
<p>asin(2) = {{ math.Asin 2 }}（超出定义域）</p>
```

Hugo 0.167.0 实测渲染为：

```html
<p>asin(1) = 1.5707963267948966 弧度</p>
<p>asin(0.5) = 30.000000000000004 度</p>
<p>asin(2) = NaN（超出定义域）</p>
```

**你应当看到什么**：`asin(1)` 是 π/2 弧度；`asin(0.5)` 换算成角度应为 30°，实测 `30.000000000000004`——浮点误差，需要整数用 [`math.Round`](/functions/math/round/)；`asin(2)` 超出 `[-1, 1]` 时返回 `NaN` 而不报错，页面上会直接显示 `NaN`。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，单语言站点，Windows。

| 输入 | 结果 | 是否报错 |
| --- | --- | --- |
| `1` | `1.5707963267948966` | 否 |
| `0.5` | `0.5235987755982989`（弧度）；转角度 `30.000000000000004` | 否 |
| `2`、`-2`（超出 `[-1,1]`） | `NaN` | 否 |
| 非数字字符串 `"x"` | 上游未说明；同类三角函数的报错见 [`math.Sqrt`](/functions/math/sqrt/) | 是 |
| 返回类型 | `float64`（弧度） | 否 |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 没报错但结果不对 | 页面显示 `NaN` | 输入超出 `[-1, 1]` | 判断范围后给兜底值 |
| 没报错但结果不对 | 得到 1.57 而不是 90 | 结果是弧度，不是度 | 套 [`math.ToDegrees`](/functions/math/todegrees/) |
| 没报错但结果不对 | 角度差零点几 | 浮点误差 | 用 [`math.Round`](/functions/math/round/) 或 `printf "%.0f"` |

更多排查入口见[故障排查](/troubleshooting/)。
