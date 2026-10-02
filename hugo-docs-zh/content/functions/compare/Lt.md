+++
title = "compare.Lt"
linkTitle = "compare.Lt"
description = "报告第一个参数是否小于所有后续参数。"
date = 2026-10-02
weight = 80
source = "https://gohugo.io/functions/compare/lt/"

[params.functions_and_methods]
signatures = ["compare.Lt ARG1 ARG2 [ARG...]"]
returnType = "bool"
aliases = ["lt"]
+++

## 这一页解决什么问题

`lt` 是最常用的比较函数之一：日期早于某个时点、价格低于阈值、序号小于当前项。它就是**严格小于**，相等不算。

`lt` 与 `compare.Lt` 是同一个函数：`lt` 是别名。它与 [`le`](/functions/compare/le/) 只差「相等算不算」这一点。

## 什么时候用，什么时候别用

**该用**：

- 严格小于某个值：`{{ if lt .Date now }}`（发布时间早于现在）；
- 区间上界（半开区间）：`{{ if and (ge $x $lo) (lt $x $hi) }}`；
- 比较字符串的字典序（大小写敏感）。

**别用**：

- 允许相等 → 用 [`le`](/functions/compare/le/)；
- 想判断相等 → 用 [`eq`](/functions/compare/eq/)；
- 想按时间排序 → 用 [`collections.Sort`](/functions/collections/sort/) 或 `.ByDate`；`lt` 不排序；
- 侧边栏要「只显示前 N 条」→ 用 [`collections.First`](/functions/collections/first/)；
- 一侧是无法解析为数字的字符串 → **实测 `lt 1 "abc"` → `false`、`lt -1 "abc"` → `true`（`"abc"` 按 `0` 处理）**；不同数据源混比前先 [`cast.ToInt`](/functions/cast/toint/)。

## 用法

`compare.Lt` 函数报告第一个参数是否小于所有后续参数。数字按值比较，与类型无关。你也可以用该函数比较字符串、布尔值、日期以及其他可比较的数据类型。

## 示例

```go-html-template
{{ compare.Lt 1 1 }} → false
{{ compare.Lt 1 2 }} → true
{{ compare.Lt 2 1 }} → false

{{ compare.Lt 1 1 1 }} → false
{{ compare.Lt 1 1 2 }} → false
{{ compare.Lt 1 2 1 }} → false
{{ compare.Lt 1 2 2 }} → true

{{ compare.Lt 2 1 1 }} → false
{{ compare.Lt 2 1 2 }} → false
{{ compare.Lt 2 2 1 }} → false
```

比较不同类型的数字：

```go-html-template
{{ compare.Lt 1 1.0 }} → false
```

比较其他数据类型：

```go-html-template
{{ compare.Lt "ab" "a" }} → false
{{ compare.Lt time.Now (time.AsTime "1964-12-30") }} → false
{{ compare.Lt true false }} → false
```

## 完整示例：严格小于阈值

```go-html-template {file="layouts/_partials/threshold.html"}
{{ $n := 5 }}
<p>{{ lt $n 5 }}</p>
<p>{{ lt $n 6 }}</p>
<p>{{ lt "1" 2 }}</p>
```

Hugo 渲染为（变量赋值行本身会留下空行，这里省略）：

```html
<p>false</p>
<p>true</p>
<p>true</p>
```

**你应当看到什么**：第一行是 `false`——`5` 不小于 `5`；第二行是 `true`。第一行换成 [`le`](/functions/compare/le/) 就会变成 `true`，这是两者唯一的分界。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，单语言站点（`locale = 'zh-CN'`），Windows。

| 比较 | 结果 | 是否报错 |
| --- | --- | --- |
| `lt 1 1` / `lt 1 2` / `lt 2 1` | `false` / `true` / `false` | 否 |
| `lt 1 1.0`（`int` 与 `float`） | `false`（按值相等） | 否 |
| `lt 1 "2"`、`lt "1" 2`（可解析的数字字符串） | `true` | 否 |
| `lt 1 "abc"` / `lt -1 "abc"`（无法解析的字符串） | `false` / `true`（`"abc"` 按 `0` 处理） | 否 |
| `lt nil nil` | `false` | 否 |
| `lt "b" "a"`、`lt "ab" "a"`（两个字符串按字典序） | `false` | 否 |
| `lt true false` | `false` | 否 |
| 多参数 `lt 1 2 2` / `lt 1 2 1` | `true` / `false`（必须**全部**成立） | 否 |
| `lt 1`（只有 1 个参数） | —— | 是：`error calling lt: missing arguments for comparison` |
| 返回类型 | `bool` | 否 |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 没报错但结果不对 | 相等时希望成立，结果却是 `false` | `lt` 是严格小于 | 改用 [`le`](/functions/compare/le/) |
| 没报错但结果不对 | 与文本参数比较，结果莫名其妙 | 无法解析为数字的字符串按 `0` 处理 | 先校验并转换（[`cast.ToInt`](/functions/cast/toint/)） |
| 没报错但结果不对 | 以为 `lt` 会改变数据顺序 | `lt` 只返回布尔值 | 排序用 [`collections.Sort`](/functions/collections/sort/) |
| 报错看不懂 | `missing arguments for comparison` | 只传了一个参数 | `lt` 至少需要两个参数 |

更多排查入口见[故障排查](/troubleshooting/)。
