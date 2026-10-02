+++
title = "math.Max"
linkTitle = "math.Max"
description = "返回所有数字中的最大值。接受标量、切片，或两者混用。"
date = 2026-10-02
weight = 140
source = "https://gohugo.io/functions/math/max/"

[params.functions_and_methods]
signatures = ["math.Max VALUE..."]
returnType = "float64"
+++

## 这一页解决什么问题

从一组数里取最大值：最高价、最长阅读时长、最重的文件体积。数据通常已经在切片里（`where` 的结果、参数数组），而 `math.Max` 可以直接吃切片，不必自己写循环比较。

```go-html-template
{{ math.Max 1 (slice 2 3) 4 }} → 4
```

## 什么时候用，什么时候别用

**该用**：

- 求数值集合的最大值，集合可能来自 `slice`、页面参数或 `where` 结果；
- 需要把标量与切片混在一起比较。

**别用**：

- 求最小值 → 用 [`math.Min`](/functions/math/min/)；
- 求和 → 用 [`math.Sum`](/functions/math/sum/)；
- 想找「最大值对应的那个元素」（而不是数值本身）→ 用 [`collections.Sort`](/functions/collections/sort/) 后取第一个，或自己 `range` 比较；`math.Max` 只返回数字；
- 集合里是字符串 → 本函数只处理数字；比较字符串用 [`compare`](/functions/compare/) 系列。

## 完整示例：从切片里取最高价

```go-html-template {file="layouts/_partials/max-demo.html"}
{{ $prices := slice 19.9 7.5 42 }}
<p>最高价：{{ math.Max $prices }}</p>
<p>与标量混用：{{ math.Max 1 (slice 2 3) 4 }}</p>
```

Hugo 0.167.0 实测渲染为：

```html
<p>最高价：42</p>
<p>与标量混用：4</p>
```

**你应当看到什么**：切片可以直接传入，不需要展开；`math.Max 1 (slice 2 3) 4` 把标量与切片混在一起比较，得到 `4`。返回值类型是 `float64`（即使集合里全是整数）。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，单语言站点，Windows。

| 输入 | 结果 | 是否报错 |
| --- | --- | --- |
| `1 (slice 2 3) 4` | `4`（类型 `float64`） | 否 |
| `(slice 3 7 5)`（只给切片） | `7`（实测） | 否 |
| 单个数字 | 返回该数字本身 | 否 |
| 不传参数 | —— | 是：`error calling Max: must provide at least one number` |
| 切片里含非数字 | 上游未说明 | 视情况 |
| 返回类型 | `float64` | 否 |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 报错看不懂 | `must provide at least one number` | 没传参数，或在 `with` 分支里传了空值 | 确认参数来源非空 |
| 没报错但结果不对 | 明明是整数却打印成小数 | 返回 `float64`（Go 打印整数浮点时会省略 `.0`，所以通常看不出来） | 需要整型时套 [`cast.ToInt`](/functions/cast/toint/) |
| 没报错但结果不对 | 字符串集合取不到最大值 | 该函数只处理数字 | 用 [`collections.Sort`](/functions/collections/sort/) 比较字符串 |
| 没报错但结果不对 | 想要「最大值对应的页面」却只拿到数字 | `math.Max` 只返回数值 | 改用 `sort` + `first`，或自己 `range` 记录 |

更多排查入口见[故障排查](/troubleshooting/)。
