+++
title = "compare.Le"
linkTitle = "compare.Le"
description = "报告第一个参数是否小于或等于所有后续参数。"
date = 2026-10-02
weight = 70
source = "https://gohugo.io/functions/compare/le/"

[params.functions_and_methods]
signatures = ["compare.Le ARG1 ARG2 [ARG...]"]
returnType = "bool"
aliases = ["le"]
+++

## 这一页解决什么问题

「不超过」类判断：字数限制、显示条数上限、区间上界。`le` 是 [`gt`](/functions/compare/gt/) 的反面，**包含相等**。

`le` 与 `compare.Le` 是同一个函数：`le` 是别名。

## 什么时候用，什么时候别用

**该用**：

- 上限判断：`{{ if le (len .Params.tags) 3 }}`；
- 区间上界：`{{ if and (gt $x $lo) (le $x $hi) }}`；
- 与其他比较函数组成「两端闭合」或「半开半闭」的区间。

**别用**：

- 只要严格小于（相等时不成立）→ 用 [`lt`](/functions/compare/lt/)；
- 判断相等 → 用 [`eq`](/functions/compare/eq/)；
- 侧边栏要「截断到 N 条」→ 这是取数据，不是判断，用 [`collections.First`](/functions/collections/first/)；
- 两侧可能有无法解析为数字的字符串 → **实测 `le 1 "abc"` → `false`（`"abc"` 按 `0` 处理）**；不要依赖这种隐式转换，先 [`cast.ToInt`](/functions/cast/toint/)。

## 用法

`compare.Le` 函数报告第一个参数是否小于或等于所有后续参数。数字按值比较，与类型无关。你也可以用该函数比较字符串、布尔值、日期以及其他可比较的数据类型。

## 示例

```go-html-template
{{ compare.Le 1 1 }} → true
{{ compare.Le 1 2 }} → true
{{ compare.Le 2 1 }} → false

{{ compare.Le 1 1 1 }} → true
{{ compare.Le 1 1 2 }} → true
{{ compare.Le 1 2 1 }} → true
{{ compare.Le 1 2 2 }} → true

{{ compare.Le 2 1 1 }} → false
{{ compare.Le 2 1 2 }} → false
{{ compare.Le 2 2 1 }} → false
```

比较不同类型的数字：

```go-html-template
{{ compare.Le 1 1.0 }} → true
```

比较其他数据类型：

```go-html-template
{{ compare.Le "ab" "a" }} → false
{{ compare.Le time.Now (time.AsTime "1964-12-30") }} → false
{{ compare.Le true false }} → false
```

## 完整示例：判断是否在限额之内

```go-html-template {file="layouts/_partials/limit.html"}
{{ $n := 5 }}
<p>{{ le $n 5 }}</p>
<p>{{ le $n 4 }}</p>
<p>{{ le "1" 2 }}</p>
```

Hugo 渲染为（变量赋值行本身会留下空行，这里省略）：

```html
<p>true</p>
<p>false</p>
<p>true</p>
```

**你应当看到什么**：第一行是 `true`——`le` 把相等算作成立，这是它与 [`lt`](/functions/compare/lt/) 的唯一区别；第三行说明可解析的数字字符串会按数字参与比较。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，单语言站点（`locale = 'zh-CN'`），Windows。

| 比较 | 结果 | 是否报错 |
| --- | --- | --- |
| `le 1 1` / `le 1 2` / `le 2 1` | `true` / `true` / `false` | 否 |
| `le 1 1.0`（`int` 与 `float`） | `true` | 否 |
| `le "1" 2`、`le 1 "2"`（可解析的数字字符串） | `true` | 否 |
| `le 1 "abc"`（无法解析的字符串） | `false`（`"abc"` 按 `0` 处理） | 否 |
| `le nil nil` | `true` | 否 |
| `le "b" "a"`（两个字符串按字典序） | `false` | 否 |
| `le true false` | `false` | 否 |
| 多参数 `le 1 1 2` / `le 2 1 1` | `true` / `false`（必须**全部**成立） | 否 |
| `le 1`（只有 1 个参数） | —— | 是：`error calling le: missing arguments for comparison` |
| 返回类型 | `bool` | 否 |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 没报错但结果不对 | 相等时希望不成立，结果却是 `true` | `le` 包含相等 | 改用 [`lt`](/functions/compare/lt/) |
| 没报错但结果不对 | 与文本参数比较，结果不合预期 | 无法解析为数字的字符串按 `0` 处理 | 先校验数据类型，必要时 [`cast.ToInt`](/functions/cast/toint/) |
| 没报错但结果不对 | 想「取前三项」却只做了判断 | `le` 只返回布尔值，不改变数据 | 取数据用 [`collections.First`](/functions/collections/first/) |
| 报错看不懂 | `missing arguments for comparison` | 只传了一个参数 | `le` 至少需要两个参数 |

更多排查入口见[故障排查](/troubleshooting/)。
