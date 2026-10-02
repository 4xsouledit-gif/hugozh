+++
title = "and"
linkTitle = "and"
description = "返回第一个假值参数；若所有参数都为真值，则返回最后一个参数。"
date = 2026-10-02
weight = 10
source = "https://gohugo.io/functions/go-template/and/"

[params.functions_and_methods]
signatures = ["and VALUE..."]
returnType = "any"
+++

## 这一页解决什么问题

模板里经常要「这些条件全都成立才继续」。`and` 就是 Go 模板的「与」运算：它从左到右求值，**遇到第一个假值就把它返回**，后面的参数**不再求值**（短路）；如果所有参数都是真值，返回**最后一个参数**。

要记住的关键点是：`and` 返回的是参与运算的那个值本身，不是 `true`/`false`。所以 `{{ and 1 2 3 }}` 得到 `3`，`{{ and "a" 1 true }}` 得到 `true`——同一个函数返回的类型可以完全不同。

## 什么时候用，什么时候别用

**该用**：

- 一个 `if` 里要塞多个条件，例如「有标题、而且不是草稿」；
- 想借短路避免出错：`{{ and false (math.Div 1 0) }}` 里的除法**不会执行**（实测输出 `false`，构建不报错），可以把「先判断、再计算」压进一个表达式；
- 需要「全都成立时取最后一个值」的表达式，例如 `and .Params.image .Params.image.alt`。

**别用**：

- 只要布尔结果 → 用 `not` 套两层（实测 `{{ 42 | not | not }}` → `true`），或直接用 [`eq`](/functions/compare/eq/) 等比较函数；
- 「任一成立」→ 用 [`or`](/functions/go-template/or/)；
- 条件超过两三个、或要分别处理不同分支 → 用 [`if`](/functions/go-template/if/) / `else if` 更好读；
- 想判断「字段在不在」→ 用 [`with`](/functions/go-template/with/) 或与 `nil` 比较，不要用 `and` 猜。

## 关于真值与假值

假值包括 `false`、`0`、任何 `nil` 指针或接口值、任何长度为零的数组、切片、映射或字符串，以及零值 `time.Time`。

其余一切值都是真值。

## 用法

`and` 函数从左到右依次求值，一旦结果可以确定就立即返回。

```go-html-template
{{ and 1 0 "" }} → 0 (int)
{{ and 1 false 0 }} → false (bool)

{{ and 1 2 3 }} → 3 (int)
{{ and "a" "b" "c" }} → c (string)
{{ and "a" 1 true }} → true (bool)

{{ and false (math.Div 1 0) }} → false (bool)
```

更多信息参见 Go 的 [`text/template`](https://pkg.go.dev/text/template) 文档。

## 完整示例（实测）

```go-html-template
{{ and 1 0 "" }} → 0 (int)
{{ and 1 false 0 }} → false (bool)
{{ and 1 2 3 }} → 3 (int)
{{ and "a" "b" "c" }} → c (string)
{{ and "a" 1 true }} → true (bool)
{{ and false (math.Div 1 0) }} → false (bool)
{{ and 1 nil }} → <nil> (nil)
```

Hugo 0.167.0 实测：以上七行逐条与 `→` 后的结果一致。第六行说明**短路**是生效的——`math.Div 1 0` 根本没有执行；最后一行说明 `nil` 会被当作假值返回。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended（windows/amd64），最小站点，单语言（`locale = "zh-CN"`）。

| 情况 | 返回 | 是否报错 |
| --- | --- | --- |
| 全部为真值 | 最后一个参数（原类型） | 否 |
| 遇到假值 | 第一个假值参数（原类型） | 否 |
| 遇到 `nil` | `nil`；`printf "%v"` 打印 `<nil>` | 否 |
| 参数含 `false (math.Div 1 0)` | `false`，除法不执行 | 否 |
| 返回类型 | 由返回的那个参数决定：实测 `%T` 得到 `int`、`bool`、`string`（签名标注为 `any`） | 否 |

`and` 不会把结果强制转成布尔值，需要布尔值时用 `not not` 或比较函数。

更多排查入口见[故障排查](/troubleshooting/)。
