+++
title = "math.Atan"
linkTitle = "math.Atan"
description = "返回给定数字的反正切值，以弧度为单位。"
date = 2026-10-02
weight = 60
source = "https://gohugo.io/functions/math/atan/"

[params.functions_and_methods]
signatures = ["math.Atan VALUE"]
returnType = "float64"
+++

## 这一页解决什么问题

已知「对边 ÷ 斜边」之外的斜率（对边 ÷ 邻边）时求角度：`math.Atan` 给你一个单参数的反正切，**单位是弧度**。

```go-html-template
{{ math.Atan 1 }} → 0.7853981633974483
```

它是 `atan2(y, x)` 的简化形式——**只有一个参数**，因此无法区分「在哪个象限」。

## 什么时候用，什么时候别用

**该用**：

- 只有一个比值（斜率），且不关心象限；
- 与 [`math.ToDegrees`](/functions/math/todegrees/) 配合换算出角度。

**别用**：

- 知道坐标 `(x, y)` 想求方向角 → 用 [`math.Atan2`](/functions/math/atan2/)（它能根据符号给出正确象限）；
- 已知正弦/余弦 → 用 [`math.Asin`](/functions/math/asin/)、[`math.Acos`](/functions/math/acos/)。

## 完整示例：由斜率求角度

```go-html-template {file="layouts/_partials/atan-demo.html"}
{{ $slope := div 1.0 1 }}
<p>斜率 1 的倾角：{{ math.ToDegrees (math.Atan $slope) }} 度</p>
<p>atan(1) = {{ math.Atan 1 }} 弧度</p>
<p>同样的 1，用 atan2 给坐标 (1, 1)：{{ math.ToDegrees (math.Atan2 1 1) }} 度</p>
```

Hugo 0.167.0 实测渲染为：

```html
<p>斜率 1 的倾角：45 度</p>
<p>atan(1) = 0.7853981633974483 弧度</p>
<p>同样的 1，用 atan2 给坐标 (1, 1)：45 度</p>
```

**你应当看到什么**：`atan 1` 是 π/4 = 45°，换算后正好整数 `45`；写法上用浮点除法 `div 1.0 1` 保证结果是浮点数（若是 `div 1 1` 会先变成整数运算）。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，单语言站点，Windows。

| 输入 | 结果 | 是否报错 |
| --- | --- | --- |
| `1` | `0.7853981633974483`（转角度 `45`） | 否 |
| `0` | `0` | 否 |
| 负数（如 `-1`） | `-0.7853981633974483`（转角度 `-45`） | 否 |
| 非数字字符串 `"x"` | 上游未说明；同类三角函数的报错见 [`math.Sqrt`](/functions/math/sqrt/) | 是 |
| 返回类型 | `float64`（弧度，范围 `(-π/2, π/2)`） | 否 |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 没报错但结果不对 | 第二、三象限的角度算出来是负的或错的 | `atan` 只接受一个比值，无法判断象限 | 改用 [`math.Atan2`](/functions/math/atan2/) 并传入两个坐标分量 |
| 没报错但结果不对 | 得到 0.785 而不是 45 | 结果是弧度 | 套 [`math.ToDegrees`](/functions/math/todegrees/) |
| 报错看不懂 | 报错提到非数字 | 传入了字符串 | 用 [`cast.ToFloat`](/functions/cast/tofloat/) 转换 |

更多排查入口见[故障排查](/troubleshooting/)。
