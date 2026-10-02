+++
title = "compare.Gt"
linkTitle = "compare.Gt"
description = "报告第一个参数是否大于所有后续参数。"
date = 2026-10-02
weight = 60
source = "https://gohugo.io/functions/compare/gt/"

[params.functions_and_methods]
signatures = ["compare.Gt ARG1 ARG2 [ARG...]"]
returnType = "bool"
aliases = ["gt"]
+++

## 这一页解决什么问题

「超过」与「达到」在判断上是两回事：文章数超过 5 篇才显示分页、评分高于阈值才推荐、日期晚于某个时点才算未来事件。`gt` 就是**严格大于**——相等不算。

`gt` 与 `compare.Gt` 是同一个函数：`gt` 是别名。它与 [`ge`](/functions/compare/ge/) 只差「相等算不算」这一点。

## 什么时候用，什么时候别用

**该用**：

- 严格超过某个值：`{{ if gt (len .Pages) 5 }}`；
- 区间上界：`{{ if and (gt $x $lo) (le $x $hi) }}`；
- 比较日期先后：`gt .Date now` 表示「晚于现在」；两个字符串比较会按字典序（大小写敏感）。

**别用**：

- 允许相等 → 用 [`ge`](/functions/compare/ge/)；
- 判断相等 → 用 [`eq`](/functions/compare/eq/)；
- 其中一侧可能是无法解析为数字的字符串 → **实测 `gt 1 "abc"` → `true`（`"abc"` 按 `0` 处理）**，不报错但结果容易误导；先 [`cast.ToInt`](/functions/cast/toint/)；
- 想做「取前 N 个」「排序」→ 用 [`collections.First`](/functions/collections/first/) / [`collections.Sort`](/functions/collections/sort/)，`gt` 不改变数据。

## 用法

`compare.Gt` 函数报告第一个参数是否大于所有后续参数。数字按值比较，与类型无关。你也可以用该函数比较字符串、布尔值、日期以及其他可比较的数据类型。

## 示例

```go-html-template
{{ compare.Gt 1 1 }} → false
{{ compare.Gt 1 2 }} → false
{{ compare.Gt 2 1 }} → true

{{ compare.Gt 1 1 1 }} → false
{{ compare.Gt 1 1 2 }} → false
{{ compare.Gt 1 2 1 }} → false
{{ compare.Gt 1 2 2 }} → false

{{ compare.Gt 2 1 1 }} → true
{{ compare.Gt 2 1 2 }} → false
{{ compare.Gt 2 2 1 }} → false
```

比较不同类型的数字：

```go-html-template
{{ compare.Gt 1 1.0 }} → false
```

比较其他数据类型：

```go-html-template
{{ compare.Gt "ab" "a" }} → true
{{ compare.Gt time.Now (time.AsTime "1964-12-30") }} → true
{{ compare.Gt true false }} → true
```

## 完整示例：严格超过阈值

```go-html-template {file="layouts/_partials/threshold.html"}
{{ $n := 5 }}
<p>{{ gt $n 5 }}</p>
<p>{{ gt $n 4 }}</p>
<p>{{ gt "2" 1 }}</p>
```

Hugo 渲染为（变量赋值行本身会留下空行，这里省略）：

```html
<p>false</p>
<p>true</p>
<p>true</p>
```

**你应当看到什么**：第一行是 `false`——`5` 不大于 `5`，这正是 `gt` 与 [`ge`](/functions/compare/ge/) 的区别；第三行是 `true`——可解析的数字字符串会按数字参与比较。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，单语言站点（`locale = 'zh-CN'`），Windows。

| 比较 | 结果 | 是否报错 |
| --- | --- | --- |
| `gt 1 1` / `gt 1 2` / `gt 2 1` | `false` / `false` / `true` | 否 |
| `gt 1 1.0`（`int` 与 `float`） | `false`（按值相等） | 否 |
| `gt 2 "1"`、`gt "2" 1`（可解析的数字字符串） | `true` | 否 |
| `gt 1 "abc"`、`gt 0 "abc"`、`gt "abc" 0`（无法解析的字符串） | `true` / `false` / `false`（`"abc"` 按 `0` 处理） | 否 |
| `gt "ab" "a"`（两个字符串按字典序） | `true` | 否 |
| `gt true false` / `gt false true` | `true` / `false` | 否 |
| 多参数 `gt 2 1 1` / `gt 2 1 2` | `true` / `false`（必须**全部**成立） | 否 |
| `gt 1`（只有 1 个参数） | —— | 是：`error calling gt: missing arguments for comparison` |
| 返回类型 | `bool` | 否 |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 没报错但结果不对 | 数值相等时希望为真，结果却是 `false` | `gt` 是严格大于 | 改用 [`ge`](/functions/compare/ge/) |
| 没报错但结果不对 | 与文本参数比较，结果莫名其妙为 `true` | 无法解析为数字的字符串按 `0` 处理 | 先校验并 [`cast.ToInt`](/functions/cast/toint/) 转换 |
| 没报错但结果不对 | 多参数写法只满足一个条件却返回 `false` | `gt` 要求对**所有**后续参数成立 | 用 `or` 组合多个 `gt` |
| 报错看不懂 | `missing arguments for comparison` | 只传了一个参数 | `gt` 至少需要两个参数 |

更多排查入口见[故障排查](/troubleshooting/)。
