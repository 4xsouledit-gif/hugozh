+++
title = "math.Acos"
linkTitle = "math.Acos"
description = "返回给定数字的反余弦值，以弧度为单位。"
date = 2026-10-02
weight = 30
source = "https://gohugo.io/functions/math/acos/"

[params.functions_and_methods]
signatures = ["math.Acos VALUE"]
returnType = "float64"
+++

## 这一页解决什么问题

给定一个余弦值，反推出角度——这是 `math.Acos` 的用途，例如根据「投影长度 ÷ 斜边」求夹角、做简单的几何计算。

```go-html-template
{{ math.Acos 1 }} → 0
```

**注意单位是弧度**，人类可读的角度值要用 [`math.ToDegrees`](/functions/math/todegrees/) 换算。

## 什么时候用，什么时候别用

**该用**：

- 已知余弦值求角度（几何、坐标计算）；
- 与 [`math.ToDegrees`](/functions/math/todegrees/) 或 [`math.ToRadians`](/functions/math/toradians/) 配合完成角度换算。

**别用**：

- 只想把弧度显示成角度 → 用 [`math.ToDegrees`](/functions/math/todegrees/)；
- 需要正弦/正切的反函数 → 用 [`math.Asin`](/functions/math/asin/)、[`math.Atan`](/functions/math/atan/)／[`math.Atan2`](/functions/math/atan2/)；
- 想用角度值调用 → 先 [`math.ToRadians`](/functions/math/toradians/) 换过来，反三角函数只接受弧度。

## 完整示例：由余弦值求角度

```go-html-template {file="layouts/_partials/angle.html"}
<p>acos(1) = {{ math.Acos 1 }} 弧度</p>
<p>acos(0.5) = {{ math.ToDegrees (math.Acos 0.5) }} 度</p>
<p>acos(2) = {{ math.Acos 2 }}（超出定义域）</p>
```

Hugo 0.167.0 实测渲染为：

```html
<p>acos(1) = 0 弧度</p>
<p>acos(0.5) = 59.99999999999999 度</p>
<p>acos(2) = NaN（超出定义域）</p>
```

**你应当看到什么**：`acos(0.5)` 数学上是 60°，实测得到 `59.99999999999999`——浮点运算的正常误差，**不要**期望得到整 60；需要整数就用 [`math.Round`](/functions/math/round/)。`acos(2)` 超出定义域，**不报错**，返回 `NaN`，页面会直接显示 `NaN`，所以对用户输入要先做范围校验。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，单语言站点，Windows。

| 输入 | 结果 | 是否报错 |
| --- | --- | --- |
| `1` | `0` | 否 |
| `0.5` | `1.0471975511965979`（弧度）；转角度为 `59.99999999999999` | 否 |
| `2`、`-2`（超出 `[-1,1]`） | `NaN` | 否 |
| 数字字符串（如 `"0.5"`） | 上游未说明；实测同类函数接受数字字符串（见 [`math.Round`](/functions/math/round/)） | 否 |
| 非数字字符串 `"x"` | 上游未说明；同类函数的报错类型见 [`math.Sqrt`](/functions/math/sqrt/) | 是 |
| 返回类型 | `float64`（弧度） | 否 |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 没报错但结果不对 | 页面显示 `NaN` | 输入超出 `[-1, 1]` | 先判断范围，或用 `if` 给兜底文案 |
| 没报错但结果不对 | 角度值差一点点（59.9999…） | 浮点误差 | 用 [`math.Round`](/functions/math/round/) 取整，或 `printf "%.0f"` |
| 没报错但结果不对 | 角度完全不对 | 把结果当成了「度」，其实单位是弧度 | 套 [`math.ToDegrees`](/functions/math/todegrees/) |

更多排查入口见[故障排查](/troubleshooting/)。
