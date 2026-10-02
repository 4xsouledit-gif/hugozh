+++
title = "collections.Seq"
linkTitle = "seq"
description = "返回一个整数切片：从 1 或指定值开始，按 1 或指定步长递增，到指定值结束。"
date = 2026-10-02
weight = 210
source = "https://gohugo.io/functions/collections/seq/"

[params.functions_and_methods]
returnType = "[]int"
aliases = ["seq"]
+++

## 这一页解决什么问题

`seq` 生成一串整数，用来做「循环固定次数」「编号」「等差数列」。它有三种参数形式（见签名）：

```text
collections.Seq LAST                       从 1 到 LAST
collections.Seq FIRST LAST                 从 FIRST 到 LAST
collections.Seq FIRST INCREMENT LAST       从 FIRST 开始，每次加 INCREMENT
```

**最容易记错的一点**：`seq 5` 得到的是 `[1 2 3 4 5]`，**从 1 开始、不是从 0 开始**。需要 0 起请写 `seq 0 5`。

## 什么时候用，什么时候别用

**该用**：

- 模板里需要跑固定次数的循环（占位符、星级、评分）；
- 生成连续编号；
- 生成等差数列。

**别用**：

- 想遍历页面或数据 → 用页面集合或 [`collections.Slice`](/functions/collections/slice/)；
- 想要随机顺序 → 用 [`collections.Shuffle`](/functions/collections/shuffle/) 或 [`collections.D`](/functions/collections/d/)；
- 想要字符串序列 → `seq` 只产出整数，字符串请用 `slice`。

## 用法

```go-html-template
{{ seq 2 }} → [1 2]
{{ seq 0 2 }} → [0 1 2]
{{ seq -2 2 }} → [-2 -1 0 1 2]
{{ seq -2 2 2 }} → [-2 0 2]
```

一个刻意构造的遍历整数序列的示例：

```go-html-template
{{ $product := 1 }}
{{ range seq 4 }}
  {{ $product = mul $product . }}
{{ end }}
{{ $product }} → 24
```

> [!NOTE]
> 该函数创建的切片最多包含 100 万个元素。

## 完整示例：三种参数形式与递减

```go-html-template {file="layouts/_partials/pager.html"}
<p>{{ seq 5 }}</p>
<p>{{ seq 2 5 }}</p>
<p>{{ seq 1 2 9 }}</p>
<p>{{ seq 5 1 }}</p>
<p>{{ seq 0 }}（长度 {{ len (seq 0) }}）</p>
```

Hugo 渲染为：

```html
<p>[1 2 3 4 5]</p>
<p>[2 3 4 5]</p>
<p>[1 3 5 7 9]</p>
<p>[5 4 3 2 1]</p>
<p>[]（长度 0）</p>
```

**你应当看到什么**：单参数从 **1** 开始；两参数把第一个当起点；`seq 5 1` 会自动**递减**（不需要写负步长）；`seq 0` 是空序列，不报错。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，单语言站点（`locale = 'zh-CN'`），Windows。

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| `seq 0` | 空切片（`len` 为 0） | 否 |
| `FIRST > LAST`（`seq 5 1`） | 递减序列 `[5 4 3 2 1]` | 否 |
| 步长为 0（`seq 1 0 5`） | —— | 是：`error calling seq: 'increment' must not be 0` |
| 参数不是整数（`seq "x"`） | —— | 是：`error calling seq: invalid arguments to Seq` |
| 元素上限 | 最多 100 万个元素（上游已说明） | —— |
| 返回类型 | `[]int` | 否 |

## 常见坑

| 类别 | 症状 | 真因 | 怎么改 |
| --- | --- | --- | --- |
| 没报错但结果不对 | 编号从 1 开始，想要从 0 | 单参数形式固定从 1 起 | 写 `seq 0 N`，或对结果做减法 |
| 没报错但结果不对 | 期望遍历次数等于 N，却多了一次 | 以为 `seq 5` 是 `[0 1 2 3 4]` | `seq 5` 有 5 个元素 `[1 2 3 4 5]`；要 0 起用 `seq 0 5`（会有 6 个元素） |
| 报错看不懂 | `'increment' must not be 0` | 三参数形式的步长写成 0 | 检查参数顺序 `FIRST INCREMENT LAST` |
| 报错看不懂 | `invalid arguments to Seq` | 传了非整数（如字符串） | 用整数或先 `int` 转换 |

更多排查入口见[故障排查](/troubleshooting/)。
