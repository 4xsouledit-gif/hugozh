+++
title = "compare.Conditional"
linkTitle = "compare.Conditional"
description = "根据控制参数的值返回两个参数之一。"
date = 2026-10-02
weight = 20
source = "https://gohugo.io/functions/compare/conditional/"

[params.functions_and_methods]
signatures = ["compare.Conditional CONTROL ARG1 ARG2"]
returnType = "any"
aliases = ["cond"]
+++

## 这一页解决什么问题

有些地方只能写**一个表达式**，不能写 `if`/`else` 块：函数参数、`dict` 的字面量、`printf` 的实参。这时要在两个值里二选一，就用 `cond`——`CONTROL` 为真取 `ARG1`，否则取 `ARG2`，相当于其他语言的三目运算符。

`cond` 与 `compare.Conditional` 是同一个函数：`cond` 是别名。

```go-html-template
{{ cond (gt $qty 3) "many" "few" }}
```

## 什么时候用，什么时候别用

**该用**：

- 在「只能放一个值」的位置做选择：给 `dict` 传不同的值、给 [`printf`](/functions/fmt/printf/) 传不同实参、设置变量时二选一；
- 想避免为一次二选一写四行 `if`/`else`，让模板更紧凑。

**别用**：

- 两个分支里有**可能报错的表达式** → 见下文：`cond` **没有短路求值**，两个分支都会被求值，实测 `cond true "a" (div 1 0)` 会让构建失败；
- 两个分支里有**开销大**的表达式（如 `resources.Get`、大范围 `range`）→ 同样会两边都执行；
- 只是想按条件输出不同的 HTML 片段 → 用 `if`/`else` 块更直观，也更容易读；
- 需要三个及以上分支 → 嵌套 `cond` 会难以阅读，改用 `if`/`else if`。

## 用法

`compare.Conditional` 函数根据控制参数的值返回两个参数之一。如果 `CONTROL` 为真值，函数返回 `ARG1`，否则返回 `ARG2`。

与其他语言中的[三目运算符][]不同，`compare.Conditional` 函数不进行[短路求值][]。无论 `CONTROL` 的值是什么，它都会对 `ARG1` 和 `ARG2` 两者求值。

## 示例

```go-html-template
{{ $qty := 42 }}
{{ compare.Conditional (compare.Le $qty 3) "few" "many" }} → many
```

由于缺少短路求值，下面这些示例会抛出错误：

```go-html-template
{{ compare.Conditional true "true" (div 1 0) }}
{{ compare.Conditional false (div 1 0) "false" }}
```

## 完整示例：按数量二选一

```go-html-template {file="layouts/_partials/stock.html"}
{{ $qty := 42 }}
<p>{{ cond (le $qty 3) "few" "many" }}</p>
<p>{{ cond (gt $qty 3) "many" "few" }}</p>
<p>{{ cond "" "有" "无" }}</p>
<p>{{ cond (slice) "非空" "空" }}</p>
```

Hugo 渲染为（变量赋值行本身会留下空行，这里省略）：

```html
<p>many</p>
<p>many</p>
<p>无</p>
<p>空</p>
```

**你应当看到什么**：第三行传入空字符串（假值），取到第二个分支 `无`；第四行传入空切片（假值），取到 `空`。第三、四行说明 `CONTROL` 用的是模板的真值性判断，而不是只认 `true`/`false`。**注意**：上面这些分支里都只有字面量，所以不会触发「无短路求值」的问题；一旦某个分支是会报错的表达式，构建就会失败——即使 `CONTROL` 根本不会选它，见边界表。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，单语言站点（`locale = 'zh-CN'`），Windows。

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| `CONTROL` 为 `true` / `false` | `ARG1` / `ARG2` | 否 |
| `CONTROL` 为 `""`、`0`、`0.0`、`nil`、空 `slice`、空 `dict`（假值） | `ARG2` | 否 |
| `CONTROL` 为非空字符串（包括 `"0"`、`"false"`）、非空切片 | `ARG1` | 否 |
| 分支类型不同（如 `cond true 1 "b"`） | 返回命中的那个值，类型随之变化（实测返回 `int` `1`） | 否 |
| `cond true "a" (div 1 0)` | —— | 是：`error calling div: can't divide the value by 0`（**无短路求值**，未被选中的分支照样求值） |
| `cond false (div 1 0) "b"` | —— | 是：同上 |
| `cond true "a"`（参数不足 3 个） | —— | 是：`wrong number of args for cond: want 3 got 2` |
| 返回类型 | `any` | 否 |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 构建失败 | 第二个分支里有 `div 1 0`、索引越界等，尽管 `CONTROL` 不会选它 | `cond` 不短路，两个分支都求值 | 改用 `if`/`else` 块（有短路语义），或把危险表达式提前算好再用变量传入 |
| 没报错但结果不对 | 传了字符串 `"false"` 以为会走 `ARG2` | 非空字符串是真值 | 用布尔值或 `eq $x "false"` 显式判断 |
| 没报错但结果不对 | 模板里拿到的值类型时有时无 | `cond` 返回 `any`，两个分支类型可以不同 | 需要类型稳定就先把两边都转换好（如都 [`cast.ToString`](/functions/cast/tostring/)） |
| 报错看不懂 | `wrong number of args for cond: want 3 got 2` | 少传一个分支 | `cond` 必须传满三个参数：控制值、真分支、假分支 |
| 报错看不懂 | `can't divide the value by 0`，但报错位置指向 `cond` | 真正的报错来自被求值到的那个分支 | 把分支表达式挪进 `if` 块，或先判断再计算 |

更多排查入口见[故障排查](/troubleshooting/)。

[短路求值]: https://en.wikipedia.org/wiki/Short-circuit_evaluation
[三目运算符]: https://en.wikipedia.org/wiki/Ternary_conditional_operator
