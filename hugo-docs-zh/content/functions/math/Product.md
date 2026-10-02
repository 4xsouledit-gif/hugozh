+++
title = "math.Product"
linkTitle = "math.Product"
description = "返回所有数字的乘积。接受标量、切片，或两者混用。"
date = 2026-10-02
weight = 220
source = "https://gohugo.io/functions/math/product/"

[params.functions_and_methods]
signatures = ["math.Product VALUE..."]
returnType = "float64"
+++

## 这一页解决什么问题

求一组长度的乘积：体积（长 × 宽 × 高）、多期增长率的连乘、按维度的容量。数据常常已经在切片里，`math.Product` 可以直接吃切片，不必自己写循环累乘。

```go-html-template
{{ math.Product 1 (slice 2 3) 4 }} → 24
```

## 什么时候用，什么时候别用

**该用**：

- 一组数字的连乘，尤其是集合来自 `slice`、参数或 `where` 结果；
- 需要标量与切片混用。

**别用**：

- 只有两三个固定值 → 用 [`math.Mul`](/functions/math/mul/) 更直接；
- 求和 → 用 [`math.Sum`](/functions/math/sum/)；
- 求最大/最小值 → 用 [`math.Max`](/functions/math/max/)、[`math.Min`](/functions/math/min/)。

## 完整示例：算体积

```go-html-template {file="layouts/_partials/volume.html"}
{{ $dims := slice 2 3 4 }}
<p>体积：{{ math.Product $dims }}</p>
<p>混用：{{ math.Product 1 (slice 2 3) 4 }}</p>
```

Hugo 0.167.0 实测渲染为：

```html
<p>体积：24</p>
<p>混用：24</p>
```

**你应当看到什么**：切片可直接传入并连乘；混用写法里前面的 `1` 不改变结果（相当于单位元）。返回类型 `float64`。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，单语言站点，Windows。

| 输入 | 结果 | 是否报错 |
| --- | --- | --- |
| `(slice 2 3 4)` | `24`（类型 `float64`） | 否 |
| `1 (slice 2 3) 4` | `24` | 否 |
| 含 `0` 的集合 | `0`（只要有一个 0，乘积就是 0） | 否 |
| 空集合 | 上游未说明；实测同类聚合函数在无参数时报「至少需要一个数字」 | 是 |
| 返回类型 | `float64` | 否 |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 没报错但结果不对 | 结果恒为 0 | 集合里有 0（例如未初始化的尺寸） | 先过滤 0 值再用 `Product` |
| 报错看不懂 | `must provide at least one number` | 传入的集合为空 | 用 `with`／`if` 判空后给默认值 |
| 没报错但结果不对 | 结果是「整数」但类型不对 | 返回 `float64` | 需要整数时套 [`cast.ToInt`](/functions/cast/toint/) |

更多排查入口见[故障排查](/troubleshooting/)。
