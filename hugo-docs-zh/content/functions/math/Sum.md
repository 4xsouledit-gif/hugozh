+++
title = "math.Sum"
linkTitle = "math.Sum"
description = "返回所有数字之和。接受标量、切片，或两者混用。"
date = 2026-10-02
weight = 280
source = "https://gohugo.io/functions/math/sum/"

[params.functions_and_methods]
signatures = ["math.Sum VALUE..."]
returnType = "float64"
+++

## 这一页解决什么问题

求一组数的和：总分、总价、总时长。数据通常在切片里（页面参数数组、`where` 的结果），`math.Sum` 可以直接吃切片，省掉自己写循环累加。

```go-html-template
{{ math.Sum 1 (slice 2 3) 4 }} → 10
```

## 什么时候用，什么时候别用

**该用**：

- 求数值集合的总和，集合可能是切片、标量或两者混用；
- 需要把「一列数字」快速汇总。

**别用**：

- 只有两个数相加 → 用 [`math.Add`](/functions/math/add/) 更直白；
- 求乘积 → 用 [`math.Product`](/functions/math/product/)；
- 想按字段汇总**对象数组**（如 `[{price: 1}, {price: 2}]`）→ `math.Sum` 只处理数字，需要先取出字段，例如 `math.Sum (apply $items "index" "." "price")` 或自己 `range` 累加。

## 完整示例：算总分与混用写法

```go-html-template {file="layouts/_partials/sum-demo.html"}
{{ $scores := slice 90 85 77 }}
<p>总分：{{ math.Sum $scores }}</p>
<p>混用：{{ math.Sum 1 (slice 2 3) 4 }}</p>
```

Hugo 0.167.0 实测渲染为：

```html
<p>总分：252</p>
<p>混用：10</p>
```

**你应当看到什么**：切片可直接传入；标量与切片可以混用。返回类型是 `float64`——对整数求和也如此，只是打印时看不出 `.0`。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，单语言站点，Windows。

| 输入 | 结果 | 是否报错 |
| --- | --- | --- |
| `(slice 90 85 77)` | `252`（类型 `float64`） | 否 |
| `1 (slice 2 3) 4` | `10` | 否 |
| `nil` | `0`（实测，宽松处理；不建议依赖） | 否 |
| 空切片 | 上游未说明；参照同类函数，实测 `nil` 得到 `0` | 否 |
| 含非数字元素 | 上游未说明 | 视情况 |
| 返回类型 | `float64` | 否 |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 没报错但结果不对 | 结果是 `0` | 传入的集合为空，或 `where` 过滤后没有元素 | 用 `with`／`if` 判空并给默认值 |
| 没报错但结果不对 | 对象数组求和得不到预期 | `math.Sum` 只处理数字，不认字段 | 先把字段抽成数字切片 |
| 没报错但结果不对 | 总和出现 `.0000000001` 之类尾数 | 浮点累加误差 | 显示前 [`math.Round`](/functions/math/round/) 或 `printf "%.2f"` |

更多排查入口见[故障排查](/troubleshooting/)。
