+++
title = "math.Min"
linkTitle = "math.Min"
description = "返回所有数字中的最小值。接受标量、切片，或两者混用。"
date = 2026-10-02
weight = 160
source = "https://gohugo.io/functions/math/min/"

[params.functions_and_methods]
signatures = ["math.Min VALUE..."]
returnType = "float64"
+++

## 这一页解决什么问题

从一组数里取最小值：最低价、最短时长、最早年份、最小的图片边长。数据常常已经在切片里，`math.Min` 可以直接吃切片，不必自己写循环比较。

```go-html-template
{{ math.Min 1 (slice 2 3) 4 }} → 1
```

## 什么时候用，什么时候别用

**该用**：

- 求数值集合的最小值（切片、标量、或两者混用）；
- 需要把「上限/下限」对一组数据做比较。

**别用**：

- 求最大值 → 用 [`math.Max`](/functions/math/max/)；
- 求和 → 用 [`math.Sum`](/functions/math/sum/)；
- 想找「最小值对应的那个元素」→ 用 [`collections.Sort`](/functions/collections/sort/) 后取第一个；`math.Min` 只返回数字；
- 集合里是字符串/时间 → 本函数只处理数字，字符串比较用 [`compare`](/functions/compare/)。

## 完整示例：从切片里取最低价

```go-html-template {file="layouts/_partials/min-demo.html"}
{{ $prices := slice 19.9 7.5 42 }}
<p>最低价：{{ math.Min $prices }}</p>
<p>与标量混用：{{ math.Min 1 (slice 2 3) 4 }}</p>
```

Hugo 0.167.0 实测渲染为：

```html
<p>最低价：7.5</p>
<p>与标量混用：1</p>
```

**你应当看到什么**：切片可直接传入；混用写法取到标量 `1`（比切片里的 2、3 都小）。返回类型 `float64`。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，单语言站点，Windows。

| 输入 | 结果 | 是否报错 |
| --- | --- | --- |
| `1 (slice 2 3) 4` | `1`（类型 `float64`） | 否 |
| `(slice 3 7 5)`（只给切片） | `3`（实测） | 否 |
| 单个数字 | 返回该数字本身 | 否 |
| 不传参数 | —— | 是：`error calling Min: must provide at least one number`（与 [`math.Max`](/functions/math/max/) 同类） |
| 返回类型 | `float64` | 否 |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 报错看不懂 | `must provide at least one number` | 参数为空 | 确认集合非空（例如 `where` 之后可能为空） |
| 没报错但结果不对 | 想拿「最小值对应的页面」 | 该函数只返回数值 | 用 `sort` + `first`，或 `range` 自己记录 |
| 没报错但结果不对 | 字符串集合取不到最小值 | 只支持数字 | 用 [`compare`](/functions/compare/) 或 `sort` 处理字符串 |

更多排查入口见[故障排查](/troubleshooting/)。
