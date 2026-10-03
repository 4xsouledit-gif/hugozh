+++
title = "math.Round"
linkTitle = "math.Round"
description = "返回最接近的整数，恰好为半数时向远离零的方向舍入。"
date = 2026-10-02
weight = 240
source = "https://gohugo.io/functions/math/round/"

[params.functions_and_methods]
signatures = ["math.Round VALUE"]
returnType = "float64"
+++

## 这一页解决什么问题

把浮点结果变成整数值：价格 `21.3893` 要显示成 `21`、评分 `4.6` 要显示成 `5`。取整方式有三种，`math.Round` 是「四舍五入」的那一种——**恰好为半数（`.5`）时向远离零的方向舍入**。

```go-html-template
{{ math.Round 1.5 }} → 2
```

## 什么时候用，什么时候别用

**该用**：

- 需要「最接近的整数」（四舍五入）；
- 想先把浮点误差抹平再比较或显示，例如 `math.Round (math.ToDegrees (math.Acos 0.5))`。

**别用**：

- 想向上取整（分页数）→ 用 [`math.Ceil`](/functions/math/ceil/)；
- 想向下取整（完整份数）→ 用 [`math.Floor`](/functions/math/floor/)；
- 想保留**两位小数**（价格）→ `math.Round` 只会给整数，请用 [`fmt.Printf`](/functions/fmt/printf/) 的 `%.2f`，或先乘 100 再除 100：`div (math.Round (mul $p 100)) 100`。

## 完整示例：抹平浮点误差再显示

```go-html-template {file="layouts/_partials/round-demo.html"}
{{ $raw := mul 19.99 1.07 }}
<p>原值：{{ $raw }}</p>
<p>取整：{{ math.Round $raw }}</p>
<p>round(2.5) = {{ math.Round 2.5 }}；round(-1.5) = {{ math.Round -1.5 }}</p>
```

Hugo 0.167.0 实测渲染为：

```html
<p>原值：21.3893</p>
<p>取整：21</p>
<p>round(2.5) = 3；round(-1.5) = -2</p>
```

**你应当看到什么**：`21.3893` 变成 `21`；`2.5` 变成 `3`、`-1.5` 变成 `-2`——两头都是「远离零」，**不是**银行家舍入（那会得到 2 和 -2）。如果业务上要求「.5 一律进位」，这两者恰好一致；要求「.5 舍去」就得自己处理。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，单语言站点，Windows。

| 输入 | 结果 | 是否报错 |
| --- | --- | --- |
| `1.5` | `2` | 否 |
| `2.5` | `3`（远离零） | 否 |
| `-1.5` | `-2` | 否 |
| `0.5` / `-0.5` | `1` / `-1`（实测） | 否 |
| `21.3893` | `21`（类型 `float64`） | 否 |
| 数字字符串 `"1.5"` | `2`（实测，宽松转换） | 否 |
| 返回类型 | `float64` | 否 |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 没报错但结果不对 | 想要两位小数，却只剩整数 | `math.Round` 只取整，不管小数位 | 用 `printf "%.2f"`，或 `div (math.Round (mul $p 100)) 100` |
| 没报错但结果不对 | `.5` 的取整方向与预期相反 | Go 是「半数远离零」 | 需要「半数总是向上」时自己判断小数部分 |
| 没报错但结果不对 | 结果是整数但类型是浮点 | 返回 `float64` | 需要整型时套 [`cast.ToInt`](/functions/cast/toint/) |

更多排查入口见[故障排查](/troubleshooting/)。
