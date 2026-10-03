+++
title = "compare.Ge"
linkTitle = "compare.Ge"
description = "报告第一个参数是否大于或等于所有后续参数。"
date = 2026-10-02
weight = 50
source = "https://gohugo.io/functions/compare/ge/"

[params.functions_and_methods]
signatures = ["compare.Ge ARG1 ARG2 [ARG...]"]
returnType = "bool"
aliases = ["ge"]
+++

## 这一页解决什么问题

「至少达到某个值」是模板里常见的判断：文章数够不够、评分到没到线、日期是否已经过了某个时点。`ge` 把「大于或等于」变成一个布尔值，直接给 `if` 用。

`ge` 与 `compare.Ge` 是同一个函数：`ge` 是别名。它是 [`lt`](/functions/compare/lt/) 的反面，也是 [`eq`](/functions/compare/eq/) 与 [`gt`](/functions/compare/gt/) 的并集。

## 什么时候用，什么时候别用

**该用**：

- 阈值判断：`{{ if ge (len .Pages) 5 }}`；
- 区间下界：`{{ if and (ge $x $lo) (lt $x $hi) }}`；
- 比较日期：`.Date` 是 `time.Time`，可以直接与 `now` 比（`ge .Date now` 表示「不早于现在」）。

**别用**：

- 只想判断相等 → 用 [`eq`](/functions/compare/eq/)，`ge` 会把相等也算进去；
- 严格大于 → 用 [`gt`](/functions/compare/gt/)；
- 字符串和数字混着比 → 见下文边界表：**无法解析为数字的字符串会被当作 0**（实测 `ge 1 "abc"` → `true`），这类比较不会报错，但结果常常不是你想要的；先 [`cast.ToInt`](/functions/cast/toint/) 统一类型；
- 想排序 → 用 [`collections.Sort`](/functions/collections/sort/)；`ge` 只回答是或否。

## 用法

`compare.Ge` 函数报告第一个参数是否大于或等于所有后续参数。数字按值比较，与类型无关。你也可以用该函数比较字符串、布尔值、日期以及其他可比较的数据类型。

## 示例

```go-html-template
{{ compare.Ge 1 1 }} → true
{{ compare.Ge 1 2 }} → false
{{ compare.Ge 2 1 }} → true

{{ compare.Ge 1 1 1 }} → true
{{ compare.Ge 1 1 2 }} → false
{{ compare.Ge 1 2 1 }} → false
{{ compare.Ge 1 2 2 }} → false

{{ compare.Ge 2 1 1 }} → true
{{ compare.Ge 2 1 2 }} → true
{{ compare.Ge 2 2 1 }} → true
```

比较不同类型的数字：

```go-html-template
{{ compare.Ge 1 1.0 }} → true
```

比较其他数据类型：

```go-html-template
{{ compare.Ge "ab" "a" }} → true
{{ compare.Ge time.Now (time.AsTime "1964-12-30") }} → true
{{ compare.Ge true false }} → true
```

## 完整示例：判断数量是否达到阈值

```go-html-template {file="layouts/_partials/threshold.html"}
{{ $n := 5 }}
<p>{{ ge $n 5 }}</p>
<p>{{ ge $n 6 }}</p>
<p>{{ ge "1.0" 1 }}</p>
```

Hugo 渲染为（变量赋值行本身会留下空行，这里省略）：

```html
<p>true</p>
<p>false</p>
<p>true</p>
```

**你应当看到什么**：第一行 `5 >= 5` 成立，说明 `ge` **包含相等**；第二行 `5 >= 6` 不成立；第三行把字符串 `"1.0"` 与数字 `1` 比较得到 `true`，说明可解析的数字字符串会按数字参与比较（这一点与 [`eq`](/functions/compare/eq/) 不同，`eq 1 "1"` 是 `false`）。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，单语言站点（`locale = 'zh-CN'`），Windows。

| 比较 | 结果 | 是否报错 |
| --- | --- | --- |
| `ge 1 1` / `ge 1 2` / `ge 2 1` | `true` / `false` / `true` | 否 |
| `ge 1 1.0`（`int` 与 `float`） | `true` | 否 |
| `ge 2 "1"`、`ge "2" 1`（可解析的数字字符串） | `true` | 否 |
| `ge 1 "abc"`（无法解析的字符串） | `true`（`"abc"` 按 `0` 参与比较） | 否 |
| `ge nil nil` | `true` | 否 |
| `ge "ab" "a"`（两个字符串按字典序） | `true` | 否 |
| `ge true false` | `true` | 否 |
| 多参数 `ge 2 1 2` / `ge 1 1 2` | `true` / `false`（必须**全部**成立） | 否 |
| `ge 1`（只有 1 个参数） | —— | 是：`error calling ge: missing arguments for comparison` |
| 返回类型 | `bool` | 否 |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 没报错但结果不对 | 参数是文本 `"5"`，与数字比较结果时对时错 | 可解析的数字字符串按数字比较，混合类型靠 Hugo 的数值转换 | 先 [`cast.ToInt`](/functions/cast/toint/) 统一类型，语义更明确 |
| 没报错但结果不对 | `ge` 与某个不能解析为数字的字符串比较，得到 `true` | 无法解析的字符串按 `0` 处理，`1 >= 0` 成立 | 比较前校验数据，别依赖这种隐式转换 |
| 没报错但结果不对 | 多参数写法结果和预期相反 | `ge` 要求对**所有**后续参数成立 | 只想「满足其中一个」时改用 [`eq`](/functions/compare/eq/) 的多参数形式 |
| 报错看不懂 | `missing arguments for comparison` | 只传了一个参数 | `ge` 至少需要两个参数 |

更多排查入口见[故障排查](/troubleshooting/)。
