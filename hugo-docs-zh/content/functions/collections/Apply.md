+++
title = "collections.Apply"
linkTitle = "apply"
description = "用指定的函数及参数逐个转换给定切片的元素，返回新切片。"
date = 2026-10-02
weight = 40
source = "https://gohugo.io/functions/collections/apply/"

[params.functions_and_methods]
signatures = ["collections.Apply SLICE FUNCTION PARAM..."]
returnType = "[]any"
aliases = ["apply"]
+++

## 这一页解决什么问题

`apply` 把一个函数作用到切片的**每一个元素**上，返回新切片——相当于模板里的 `map`。第二个参数是**函数名的字符串**，其余参数会传给该函数，其中 `"."` 代表当前元素：

```text
collections.Apply SLICE FUNCTION PARAM...
                   │        │        └─ 传给 FUNCTION 的参数，"." 表示元素本身
                   │        └─ 函数名字符串，如 "strings.FirstUpper"
                   └─ 被处理的切片
```

典型用途：批量把字符串首字母大写、批量替换、批量做算术。

## 什么时候用，什么时候别用

**该用**：

- 需要对列表每一项施加**同一个**现成函数（`strings.*`、`math.*`、`printf`……）；
- 变换可以用一次函数调用表达。

**别用**：

- 变换需要多步、带条件或要访问页面字段 → 用 `range` 手动累积（`apply` 一次只能调一个函数）；
- 只是想改变**显示格式** → 直接在 `range` 里内联调用更清楚；
- 想按条件挑选元素 → 用 [`collections.Where`](/functions/collections/where/)；
- 想拼接成字符串 → 用 [`collections.Delimit`](/functions/collections/delimit/)。

函数名是**大小写敏感的完整路径**，写错会直接报错（实测见文末）。

## 用法

`apply` 函数接收三个或更多参数，具体数量取决于要应用到切片元素上的函数。

第一个参数是切片本身，第二个参数是函数名，其余参数会传给该函数，其中字符串 `"."` 代表切片元素。

```go-html-template
{{ $s := slice "hello" "world" }}

{{ $s = apply $s "strings.FirstUpper" "." }}
{{ $s }} → [Hello World]

{{ $s = apply $s "strings.Replace" "." "l" "_" }}
{{ $s }} →  [He__o Wor_d]
```

## 完整示例：批量转换字符串与数字

```go-html-template {file="layouts/_partials/normalize.html"}
{{ $s := slice "hello" "world" }}
<p>首字母大写：{{ apply $s "strings.FirstUpper" "." }}</p>
<p>逐个替换 l：{{ apply (slice "hello") "strings.Replace" "." "l" "_" }}</p>
<p>用 printf 拼装：{{ apply (slice "a" "b") "printf" "%s!" "." }}</p>
<p>数字加 10：{{ apply (slice 1 2) "add" "." 10 }}</p>
<p>空切片：{{ apply (slice) "strings.FirstUpper" "." }}</p>
```

Hugo 渲染为：

```html
<p>首字母大写：[Hello World]</p>
<p>逐个替换 l：[he__o]</p>
<p>用 printf 拼装：[a! b!]</p>
<p>数字加 10：[11 12]</p>
<p>空切片：[]</p>
```

**你应当看到什么**：`"."` 被替换成每个元素；额外参数按顺序传给目标函数（`"l"`、`"_"`、`10`）；空切片返回空切片而不报错。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，单语言站点（`locale = 'zh-CN'`），Windows。

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| 输入是空切片 | 空切片 | 否 |
| 目标函数需要更多参数但没给够 | —— | 是：`error calling apply: must provide at least two numbers` |
| 函数名不存在或拼写错误 | —— | 是：`error calling apply: can't find function strings.NoSuchFn` |
| 第一个参数不是切片（如字符串 `"ab"`） | —— | 是：`error calling apply: can't apply over ab` |
| 元素类型与函数不匹配（对数字用 `strings.FirstUpper`） | 实测**不报错**，元素原样返回：`apply (slice 1 2) "strings.FirstUpper" "."` 得 `[1 2]`；混合类型得 `[A 1]` | 否 |
| 返回类型 | `[]any`（新切片，原切片不变） | 否 |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 报错看不懂 | `can't find function strings.firstupper` | 函数名大小写/命名空间写错 | 照抄函数页标题里的写法，如 `strings.FirstUpper` |
| 报错看不懂 | `must provide at least two numbers` | 目标函数参数不够 | 把 `"."` 之外的参数补齐（注意 `add` 需要两个数） |
| 报错看不懂 | `can't apply over ab` | 第一个参数传了字符串 | 先 `split` 成切片再 `apply` |
| 没报错但结果不对 | 结果没变化 | 忘了用 `=` 接住返回值（`apply` 返回新切片） | 写 `{{ $s = apply $s … }}` |

更多排查入口见[故障排查](/troubleshooting/)。
