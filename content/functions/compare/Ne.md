+++
title = "compare.Ne"
linkTitle = "compare.Ne"
description = "报告第一个参数是否不等于后续参数中的任意一个。"
date = 2026-10-02
weight = 90
source = "https://gohugo.io/functions/compare/ne/"

[params.functions_and_methods]
signatures = ["compare.Ne ARG1 ARG2 [ARG...]"]
returnType = "bool"
aliases = ["ne"]
+++

## 这一页解决什么问题

「不相等」在模板里和「相等」一样常见：排除某个 section、跳过当前项、判断参数不是默认值。`ne` 就是 [`eq`](/functions/compare/eq/) 的反面，写 `ne` 比写 `not (eq …)` 更直接。

`ne` 与 `compare.Ne` 是同一个函数：`ne` 是别名。

**读懂本页的诀窍**：`ne` 的多参数语义与 `eq` **完全相反**——`eq` 是「等于任意一个」，`ne` 是「不等于**所有**后续参数」。参数一多，这一点最容易记反。

## 什么时候用，什么时候别用

**该用**：

- 排除式判断：`{{ if ne .Section "drafts" }}`；
- 判断参数「不是某个值」，比 `not (eq …)` 少一层括号；
- 与 `eq` 成对使用，让两个分支的语义对称。

**别用**：

- 想筛出集合里所有满足条件的元素 → 用 [`where`](/functions/collections/where/)；
- 想判断「不在切片里」→ 用 [`collections.In`](/functions/collections/in/) 取反（`not (in …)`）更清楚，`ne` 比较的是两个值，不是「值 vs 集合」；
- 数字与字符串混用 → **实测 `ne 1 "1"` 是 `true`**：它不会把字符串当数字。需要数值比较先 [`cast.ToInt`](/functions/cast/toint/) / [`cast.ToFloat`](/functions/cast/tofloat/)；
- 只想做布尔取反且比较对象多于一个 → 直接用 [`not`](/functions/go-template/not/) 包住 [`eq`](/functions/compare/eq/)，可读性更好。

## 用法

`compare.Ne` 函数报告第一个参数是否不等于后续参数中的任意一个。数字按值比较，与类型无关。你也可以用该函数比较字符串、布尔值、日期以及其他可比较的数据类型。

## 示例

```go-html-template
{{ compare.Ne 1 1 }} → false
{{ compare.Ne 1 2 }} → true

{{ compare.Ne 1 1 1 }} → false
{{ compare.Ne 1 1 2 }} → false
{{ compare.Ne 1 2 1 }} → false
{{ compare.Ne 1 2 2 }} → true
```

比较不同类型的数字：

```go-html-template
{{ compare.Ne 1 1.0 }} → false
```

比较其他数据类型：

```go-html-template
{{ compare.Ne "ab" "a" }} → true
{{ compare.Ne time.Now (time.AsTime "1964-12-30") }} → true
{{ compare.Ne true false }} → true
```

## 完整示例：排除当前布局并跳过默认值

```go-html-template {file="layouts/_partials/layout-check.html"}
{{ $layout := "post" }}
<p>{{ ne $layout "page" }}</p>
<p>{{ ne 1 1.0 }}</p>
<p>{{ ne 1 "1" }}</p>
<p>{{ ne (slice 1 2) (slice 2 1) }}</p>
```

Hugo 渲染为（变量赋值行本身会留下空行，这里省略）：

```html
<p>true</p>
<p>false</p>
<p>true</p>
<p>true</p>
```

**你应当看到什么**：第二行 `ne 1 1.0` 是 `false`——`int` 与 `float` 按值相等，所以「不相等」不成立；第三行 `ne 1 "1"` 是 `true`——数字与字符串不等（与 [`eq`](/functions/compare/eq/) 的 `false` 正好互为反面）。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，单语言站点（`locale = 'zh-CN'`），Windows。

| 比较 | 结果 | 是否报错 |
| --- | --- | --- |
| `ne 1 1` / `ne 1 2` | `false` / `true` | 否 |
| `ne 1 1.0`（`int` 与 `float`） | `false` | 否 |
| `ne 1 "1"`（数字与字符串） | `true` | 否 |
| `ne nil nil` | `false`（与 `eq nil nil` 的 `true` 相反） | 否 |
| `ne (slice 1 2) (slice 2 1)`（内容不同） | `true` | 否 |
| `ne (slice 1 2) (slice 1 2)`（内容相同） | `false` | 否 |
| `ne 1`（1 个参数） | —— | 是：`error calling ne: missing arguments for comparison` |
| 返回类型 | `bool` | 否 |

> [!NOTE]
> 多参数时 `ne` 要求「不等于所有后续参数」才返回 `true`。例如上游的 `{{ compare.Ne 1 1 2 }} → false`：`1` 与后面的 `1` 相等，所以整体为假。

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 没报错但结果不对 | `ne $x 1 2` 期望「不等于 1 也不等于 2」，结果反了 | 多参数 `ne` 是「全部不等」；`eq` 才是「任一相等」 | 记住对称性：`eq` 任一相等为真，`ne` 全部不等才为真 |
| 没报错但结果不对 | 参数里写着 `1`，`ne .Params.n 1` 却是 `true` | 类型不同（数字 vs 字符串） | 先 [`cast.ToInt`](/functions/cast/toint/) 统一类型 |
| 没报错但结果不对 | 用 `ne` 判断「元素不在切片里」不生效 | `ne` 比较两个值，不处理「值 vs 集合」 | 用 [`collections.In`](/functions/collections/in/) 加 [`not`](/functions/go-template/not/) |
| 报错看不懂 | `missing arguments for comparison` | 只传了一个参数 | `ne` 至少需要两个参数 |

更多排查入口见[故障排查](/troubleshooting/)。
