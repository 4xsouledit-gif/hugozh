+++
title = "or"
linkTitle = "or"
description = "返回第一个真值参数；若所有参数都为假值，则返回最后一个参数。"
date = 2026-10-02
weight = 110
source = "https://gohugo.io/functions/go-template/or/"

[params.functions_and_methods]
signatures = ["or VALUE..."]
returnType = "any"
+++

## 这一页解决什么问题

`or` 是 Go 模板的「或」运算：从左到右求值，**返回第一个真值参数**；如果全部是假值，返回**最后一个参数**。和 [`and`](/functions/go-template/and/) 一样，它返回的是参数本身，不是 `true`/`false`。

日常用法有两类：一是「任一条件成立」，二是**默认值**——`{{ or .Params.image "images/default.png" }}`，前面的值为空时自动落回后面的值。

## 什么时候用，什么时候别用

**该用**：

- 多个条件任一成立：`{{ if or .IsHome .IsSection }}`；
- 提供兜底默认值：`{{ or .Params.subtitle "暂无副标题" }}`；
- 借短路避免出错：`{{ or true (math.Div 1 0) }}` 中的除法不会执行（实测输出 `true`）。

**别用**：

- 需要「全部成立」→ 用 [`and`](/functions/go-template/and/)；
- 需要明确的默认值语义（`false`、`0` 这类合法值也要保留）→ 用 [`compare.Default`](/functions/compare/default/)，它能区分「缺省」与「假值」；
- 只要布尔结果 → 用 `not not` 或比较函数。

## 关于真值与假值

假值包括 `false`、`0`、任何 `nil` 指针或接口值、任何长度为零的数组、切片、映射或字符串，以及零值 `time.Time`。

其余一切值都是真值。

## 用法

`or` 函数从左到右依次求值，一旦结果可以确定就立即返回。

```go-html-template
{{ or 0 1 2 }} → 1 (int)
{{ or false "a" 1 }} → a (string)
{{ or 0 true "a" }} → true (bool)

{{ or false "" 0 }} → 0 (int)
{{ or 0 "" false }} → false (bool)

{{ or true (math.Div 1 0) }} → true (bool)
```

更多信息参见 Go 的 [`text/template`](https://pkg.go.dev/text/template) 文档。

## 完整示例（实测）

```go-html-template
{{ or 0 1 2 }} → 1 (int)
{{ or false "a" 1 }} → a (string)
{{ or 0 true "a" }} → true (bool)
{{ or false "" 0 }} → 0 (int)
{{ or 0 "" false }} → false (bool)
{{ or true (math.Div 1 0) }} → true (bool)
{{ or nil "" "x" }} → x (string)
```

Hugo 0.167.0 实测：以上七行逐条与 `→` 后的结果一致。第 4、5 行是「全部为假值时返回最后一个参数」；最后一行说明 `nil` 也是假值，会被跳过。

## 返回值边界（实测）

| 情况 | 返回 | 是否报错 |
| --- | --- | --- |
| 有真值参数 | 第一个真值参数（原类型） | 否 |
| 全部为假值 | 最后一个参数（原类型） | 否 |
| `nil` 参数 | 视为假值被跳过（实测 `{{ or nil "" "x" }}` → `x`） | 否 |
| 返回类型 | 由返回的那个参数决定：实测 `%T` 得到 `int`、`string`、`bool`（签名标注为 `any`） | 否 |

`or` 不会把结果强制转成布尔值；需要布尔结果时用 `not not` 或比较函数。
