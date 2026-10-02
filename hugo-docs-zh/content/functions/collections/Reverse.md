+++
title = "collections.Reverse"
linkTitle = "Reverse"
description = "把给定切片中的元素顺序反转后返回。"
date = 2026-10-02
weight = 200
source = "https://gohugo.io/functions/collections/reverse/"

[params.functions_and_methods]
signatures = ["collections.Reverse SLICE"]
returnType = "[]any"
+++

## 这一页解决什么问题

需要「倒序输出」时用它：`.Pages` 默认按日期升序，想让最新的排前面；或者 `seq` 生成的序列要倒过来遍历。

一个容易踩的点：`collections.Reverse` 是**带命名空间的独立函数，没有 `reverse` 这样的短别名**（上游 `aliases: []`），写 `{{ reverse $s }}` 会报 `function "reverse" not defined`。页面集合上的 `Reverse` 方法（[`PAGES.Reverse`](/methods/pages/reverse/)）是另一个东西，作用在页面集合上、不接收参数。

## 什么时候用，什么时候别用

**该用**：

- 集合本身顺序已定，只需要整段反转：`$pages.Reverse` 或 `collections.Reverse $s`；
- 与 [`collections.Last`](/functions/collections/last/) 配合取「最近的 N 篇并让最新的在最前」：`$pages | last 5 | collections.Reverse`。

**别用**：

- 想「按某个 key 排序」→ 用 [`collections.Sort`](/functions/collections/sort/)（`"date" "desc"`），排序比「先排好再反转」可靠；
- 只想要末尾 N 个 → 用 [`collections.Last`](/functions/collections/last/)，它返回的是**原顺序**的末尾片段，与「反转后取前 N 个」结果顺序相反（见示例）；
- 输入不是切片（字符串、数字、`nil`）→ 见文末实测：字符串会报错；`nil` 不报错但不返回可用的切片。

## 用法

```go-html-template
{{ slice 2 1 3 | collections.Reverse }} → [3 1 2]
```

## 完整示例：反转与「取末尾」的顺序差别

```go-html-template {file="layouts/_partials/reversed.html"}
{{ $s := slice "a" "b" "c" }}
<p>原切片：{{ $s }}</p>
<p>反转：{{ $s | collections.Reverse }}</p>
<p>取末尾 2 个：{{ $s | last 2 }}</p>
<p>反转后取前 2 个：{{ $s | collections.Reverse | first 2 }}</p>
<p>空切片反转：{{ collections.Reverse (slice) }}</p>
```

Hugo 渲染为：

```html
<p>原切片：[a b c]</p>
<p>反转：[c b a]</p>
<p>取末尾 2 个：[b c]</p>
<p>反转后取前 2 个：[c b]</p>
<p>空切片反转：[]</p>
```

**你应当看到什么**：`collections.Reverse` 翻转整段顺序；`last 2` 给的是 `[b c]`（原顺序），而「反转后取前 2 个」给的是 `[c b]`——两者元素相同、顺序相反，按你要呈现的语义二选一。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，单语言站点（`locale = 'zh-CN'`），Windows。

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| 空切片 | 空切片（`len` 为 0） | 否 |
| 单元素切片 | 原样返回 | 否 |
| 元素是映射（如 `slice (dict "a" 1)`） | 正常反转，输出 `[map[a:1]]` | 否 |
| 输入是字符串 | —— | 是：`error calling Reverse: argument must be a slice` |
| 输入是 `nil` | 不报错，但没有可用的切片值（实测 `try` 返回的成功值输出为空） | 否 |
| 原切片 | 返回新切片，原变量保持不变 | 否 |
| 返回类型 | `[]any` | 否 |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 报错看不懂 | `function "reverse" not defined` | 该函数没有短别名，必须写全名 | 写 `collections.Reverse`，或用页面集合的 `Reverse` 方法 |
| 报错看不懂 | `argument must be a slice` | 把字符串当切片传进来了 | 字符串要倒序得先 `split` 成切片，或改用 `strings.Substr` 逐段取 |
| 没报错但结果不对 | 预期的顺序和实际相反 | 混淆了「取末尾 N 个」与「反转后取前 N 个」 | 按示例两者的对照结果选择 |
| 没报错但结果不对 | 页面没有按时间倒序 | 反转 ≠ 排序，集合本身的顺序才是关键 | 用 [`collections.Sort`](/functions/collections/sort/) 明确指定 key 与顺序 |

更多排查入口见[故障排查](/troubleshooting/)。
