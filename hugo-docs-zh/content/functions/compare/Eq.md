+++
title = "compare.Eq"
linkTitle = "compare.Eq"
description = "报告第一个参数是否等于后续参数中的任意一个。"
date = 2026-10-02
weight = 40
source = "https://gohugo.io/functions/compare/eq/"

[params.functions_and_methods]
signatures = ["compare.Eq ARG1 ARG2 [ARG...]"]
returnType = "bool"
aliases = ["eq"]
+++

## 这一页解决什么问题

模板里最常见的判断是「这两个值是不是同一个」：当前页是不是 `post` 类型、某个参数是不是等于 `featured`、循环到的这个元素是不是目标元素。Go 模板的 `if` 需要一个布尔值，而 `eq` 就是把「相等」变成布尔值的那个函数。

`eq` 与 `compare.Eq` 是同一个函数：`eq` 是别名，日常模板里写 `eq` 更短，遇到问题查文档时用 `compare.Eq` 这个名字能搜到本页。

## 什么时候用，什么时候别用

**该用**：

- 单值判断：`{{ if eq .Params.layout "post" }}`；
- 一次和多个候选比较：`eq $x 1 2 3`，只要**任何一个**相等就返回 `true`；
- 数字比较：不必自己把 `int` 和 `float` 统一（实测 `eq 1 1.0` → `true`）；
- 比较切片、映射的**内容**（实测按内容逐项比较，见边界表）。

**别用**：

- 判断「某个值是否在切片里」→ 用 [`collections.In`](/functions/collections/in/)；
- 从集合里筛元素 → 用 [`where`](/functions/collections/where/)；
- 只想取反 → 用 [`ne`](/functions/compare/ne/) 或 [`not`](/functions/go-template/not/)；
- 比较数字与字符串字面量 → **实测 `eq 1 "1"` 是 `false`**：相等比较不会把字符串当数字。需要数值相等就先 [`cast.ToInt`](/functions/cast/toint/) / [`cast.ToFloat`](/functions/cast/tofloat/)；
- 比较浮点数是否相等 → 精度误差会让它不可靠，比区间用 [`ge`](/functions/compare/ge/) / [`lt`](/functions/compare/lt/)。

## 用法

`compare.Eq` 函数报告第一个参数是否等于后续参数中的任意一个。数字按值比较，与类型无关。你也可以用该函数比较字符串、布尔值、日期以及其他可比较的数据类型。

## 示例

```go-html-template
{{ compare.Eq 1 1 }} → true
{{ compare.Eq 1 2 }} → false

{{ compare.Eq 1 1 1 }} → true
{{ compare.Eq 1 1 2 }} → true
{{ compare.Eq 1 2 1 }} → true
{{ compare.Eq 1 2 2 }} → false
```

比较不同类型的数字：

```go-html-template
{{ compare.Eq 1 1.0 }} → true
```

比较其他数据类型：

```go-html-template
{{ compare.Eq "ab" "a" }} → false
{{ compare.Eq time.Now (time.AsTime "1964-12-30") }} → false
{{ compare.Eq true false }} → false
```

## 完整示例：判断页面布局与多个候选值

```go-html-template {file="layouts/_partials/layout-check.html"}
{{ $layout := "post" }}
<p>{{ eq $layout "post" }}</p>
<p>{{ eq 1 1.0 }}</p>
<p>{{ eq 1 "1" }}</p>
<p>{{ eq (slice 1 2) (slice 1 2) }}</p>
<p>{{ eq (dict "a" 1) (dict "a" 2) }}</p>
```

Hugo 渲染为（变量赋值行本身会留下空行，这里省略）：

```html
<p>true</p>
<p>true</p>
<p>false</p>
<p>true</p>
<p>false</p>
```

**你应当看到什么**：第三行是 `false`——`1` 与 `"1"` 不相等，这是最容易踩的一条；第四行是 `true`——切片按内容比较，不是比较引用。把第三行换成 `eq (cast.ToInt "1") 1` 才会得到 `true`。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，单语言站点（`locale = 'zh-CN'`），Windows。

| 比较 | 结果 | 是否报错 |
| --- | --- | --- |
| `eq 1 1` / `eq 1 2` | `true` / `false` | 否 |
| `eq 1 1.0`（`int` 与 `float`） | `true` | 否 |
| `eq 1 "1"`、`eq "1" 1`（数字与字符串） | `false` | 否 |
| `eq nil nil` / `eq nil "x"` | `true` / `false` | 否 |
| `eq "ab" "ab"` | `true`（字符串按内容） | 否 |
| `eq (slice 1 2) (slice 1 2)` | `true`（按内容逐项比较） | 否 |
| `eq (slice 1) (slice 2)`、`eq (slice 1 2) (slice 2 1)` | `false` | 否 |
| `eq (dict "a" 1) (dict "a" 1)` / `eq (dict "a" 1) (dict "a" 2)` | `true` / `false` | 否 |
| `eq`（0 个参数） | —— | 是：`wrong number of args for eq: want at least 1 got 0` |
| `eq 1`（1 个参数） | —— | 是：`error calling eq: missing arguments for comparison` |
| 返回类型 | `bool` | 否 |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 没报错但结果不对 | 参数里写着 `1`，`eq .Params.n 1` 却是 `false` | 比较双方类型不同，且不强转字符串 | 用 [`cast.ToInt`](/functions/cast/toint/) / [`cast.ToFloat`](/functions/cast/tofloat/) 统一类型，或把字面量写成字符串 |
| 没报错但结果不对 | `eq $a $b` 在切片上小心地用却不报错 | 切片、映射按**内容**比较（实测） | 比较「是不是同一个对象」不要用 `eq`，改用别的方式（如比较 `.RelPermalink`） |
| 没报错但结果不对 | `eq 1 1.1` 之类浮点比较结果不合预期 | 浮点精度 | 比区间：`and (ge $x $lo) (lt $x $hi)` |
| 报错看不懂 | `missing arguments for comparison` | 只传了一个参数 | `eq` 至少需要两个参数 |
| 报错看不懂 | `wrong number of args for eq: want at least 1 got 0` | 参数写漏了（常见于管道写法 `{{ eq }}`） | 补上参数；管道形式是 `{{ $x \| eq 1 }}` |

更多排查入口见[故障排查](/troubleshooting/)。
