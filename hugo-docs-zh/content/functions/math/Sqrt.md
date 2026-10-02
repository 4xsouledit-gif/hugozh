+++
title = "math.Sqrt"
linkTitle = "math.Sqrt"
description = "返回给定数字的平方根。"
date = 2026-10-02
weight = 260
source = "https://gohugo.io/functions/math/sqrt/"

[params.functions_and_methods]
signatures = ["math.Sqrt VALUE"]
returnType = "float64"
+++

## 这一页解决什么问题

开平方：算两点距离（勾股定理）、把面积换算成边长、把方差换算成标准差。模板里没有开方运算符，用 `math.Sqrt`。

```go-html-template
{{ math.Sqrt 81 }} → 9
```

## 什么时候用，什么时候别用

**该用**：

- 勾股定理类的距离计算；
- 面积 ↔ 边长的换算。

**别用**：

- 想算任意次幂（包括开立方）→ 用 [`math.Pow`](/functions/math/pow/)，`math.Pow $x (div 1.0 3)`；
- 想算对数 → 用 [`math.Log`](/functions/math/log/)；
- 想处理负数 → 实数范围内无解；实测返回 `NaN` 而不报错，页面上会出现 `NaN`，务必先判断。

## 完整示例：勾股定理

```go-html-template {file="layouts/_partials/sqrt-demo.html"}
<p>√81 = {{ math.Sqrt 81 }}</p>
<p>勾股：{{ math.Sqrt (add (mul 3 3) (mul 4 4)) }}</p>
<p>√-1 = {{ math.Sqrt -1 }}</p>
```

Hugo 0.167.0 实测渲染为：

```html
<p>√81 = 9</p>
<p>勾股：5</p>
<p>√-1 = NaN</p>
```

**你应当看到什么**：`√(3² + 4²) = 5`；对负数返回 `NaN`（**不报错**），因此用户输入参与开方前要先校验非负。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，单语言站点，Windows。

| 输入 | 结果 | 是否报错 |
| --- | --- | --- |
| `81` | `9`（类型 `float64`） | 否 |
| `2` | `1.4142135623730951` | 否 |
| `-1` | `NaN` | 否 |
| 非数字字符串 `"x"` | —— | 是：`error calling Sqrt: Sqrt operator can't be used with non integer or float value` |
| 返回类型 | `float64` | 否 |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 没报错但结果不对 | 页面显示 `NaN` | 输入为负 | 先判断 `if ge $x 0`，否则给兜底值 |
| 报错看不懂 | `Sqrt operator can't be used with non integer or float value` | 传了字符串或其它类型 | 用 [`cast.ToFloat`](/functions/cast/tofloat/) 转换 |
| 没报错但结果不对 | 结果不是整数（如 `9` 的类型是 `float64`） | 返回类型固定为 `float64` | 需要整型时套 [`cast.ToInt`](/functions/cast/toint/) |
| 没报错但结果不对 | 开立方结果不对 | 用了 `Sqrt` 硬凑 | 用 [`math.Pow`](/functions/math/pow/) 并传分数指数 |

更多排查入口见[故障排查](/troubleshooting/)。
