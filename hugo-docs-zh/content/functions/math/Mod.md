+++
title = "math.Mod"
linkTitle = "math.Mod"
description = "返回两个整数的模。"
date = 2026-10-02
weight = 170
source = "https://gohugo.io/functions/math/mod/"

[params.functions_and_methods]
signatures = ["math.Mod VALUE1 VALUE2"]
returnType = "int64"
aliases = ["mod"]
+++

## 这一页解决什么问题

求余数：把 N 条数据按每页 M 条分组后「还剩几条」、按序号循环取色板的一格、判断能否整除。模板里没有 `%` 运算符，用 `mod`。

```go-html-template
{{ mod 15 3 }} → 0
```

## 什么时候用，什么时候别用

**该用**：

- 需要余数本身；
- 需要按固定周期循环取值（例如 `mod $i (len $colors)` 作为下标）；
- 只想判断「能否整除」→ 更推荐 [`math.ModBool`](/functions/math/modbool/)，语义更清楚。

**别用**：

- 只想要真/假结果 → 用 [`math.ModBool`](/functions/math/modbool/)；
- 想分页/分组得到份数 → 用 [`math.Div`](/functions/math/div/) 或 [`math.Ceil`](/functions/math/ceil/)；
- 操作数是浮点数 → 上游说明该函数用于**整数**；实测非整数值会报错（见下表）。

## 完整示例：分组剩余与周期取色

```go-html-template {file="layouts/_partials/mod-demo.html"}
<p>17 条数据每 5 条一组，剩 {{ mod 17 5 }} 条</p>
<p>15 mod 3 = {{ mod 15 3 }}；15 mod 4 = {{ mod 15 4 }}；-15 mod 4 = {{ mod -15 4 }}</p>
```

Hugo 0.167.0 实测渲染为：

```html
<p>17 条数据每 5 条一组，剩 2 条</p>
<p>15 mod 3 = 0；15 mod 4 = 3；-15 mod 4 = -3</p>
```

**你应当看到什么**：`-15 mod 4` 得到 `-3` 而不是 `1`——Go 的取模**余数符号跟随被除数**。如果要的是「数学上的非负余数」，需要自己补一步：`{{ $r := mod $a $b }}{{ if lt $r 0 }}{{ $r = add $r $b }}{{ end }}`。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，单语言站点，Windows。

| 输入 | 结果 | 是否报错 |
| --- | --- | --- |
| `15 3` | `0`（类型 `int64`） | 否 |
| `15 4` | `3` | 否 |
| `-15 4` | `-3`（符号跟随被除数） | 否 |
| `17 5` | `2` | 否 |
| 非整数（如 `"x" 2`） | —— | 是：`error calling mod: modulo operator can't be used with non integer value` |
| `1 0` | —— | 是：`error calling mod: the number can't be divided by zero at modulo operation` |
| 返回类型 | `int64` | 否 |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 没报错但结果不对 | 负数的余数不符合预期 | Go 取模符号跟随被除数 | 期望非负余数时手动 `add $r $b` |
| 报错看不懂 | `modulo operator can't be used with non integer value` | 传入了浮点数或字符串 | 用 [`cast.ToInt`](/functions/cast/toint/) 转换，或改用 [`math.ModBool`](/functions/math/modbool/) 判断整除 |
| 报错看不懂 | `the number can't be divided by zero at modulo operation` | 除数是 0（常见于 `len` 为空） | 先判断 `if gt (len $items) 0` |
| 没报错但结果不对 | 用余数当下标时越界 | 余数范围是 `0..除数-1`，但写反了被除数与除数 | 写成 `mod $i (len $colors)`，确保除数是集合长度 |

更多排查入口见[故障排查](/troubleshooting/)。
