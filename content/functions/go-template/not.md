+++
title = "not"
linkTitle = "not"
description = "对唯一参数取布尔反。"
date = 2026-10-02
weight = 100
source = "https://gohugo.io/functions/go-template/not/"

[params.functions_and_methods]
signatures = ["not VALUE"]
returnType = "bool"
+++

## 这一页解决什么问题

`not` 只有一个参数，返回它的布尔反。与 [`and`](/functions/go-template/and/)、[`or`](/functions/go-template/or/) 不同，`not` **总是返回 `bool`**——这正是它最有用的地方：把一个任意值「规范化」成布尔值。

连续写两次 `not` 就是常见的「转布尔」写法：实测 `{{ 42 | not | not }}` → `true`，`{{ "" | not | not }}` → `false`。

## 什么时候用，什么时候别用

**该用**：

- 条件取反：`{{ if not .Draft }}`；
- 把任意值转成布尔值（`not | not`），例如给 JS 或数据属性输出 `true`/`false`；
- 判断集合为空：`{{ if not (len .Pages) }}`。

**别用**：

- 想比较两个值 → 用 [`eq`](/functions/compare/eq/) / [`ne`](/functions/compare/ne/)；
- 想取「第一个可用值」→ 用 [`or`](/functions/go-template/or/)；
- 想给默认值 → 用 [`compare.Default`](/functions/compare/default/)。

## 用法

与 `and`、`or` 运算符不同，`not` 运算符总是返回布尔值。

```go-html-template
{{ not true }} → false
{{ not false }} → true

{{ not 1 }} → false
{{ not 0 }} → true

{{ not "x" }} → false
{{ not "" }} → true
```

连续两次使用 `not` 运算符，可以把任意值转换为布尔值。例如：

```go-html-template
{{ 42 | not | not }} → true
{{ "" | not | not }} → false
```

更多信息参见 Go 的 [`text/template`](https://pkg.go.dev/text/template) 文档。

## 完整示例（实测）

```go-html-template
{{ not true }} → false
{{ not false }} → true
{{ not 1 }} → false
{{ not 0 }} → true
{{ not "x" }} → false
{{ not "" }} → true
{{ not (slice) }} → true
{{ 42 | not | not }} → true
```

Hugo 0.167.0 实测：以上八行逐条与 `→` 后的结果一致。第 7 行说明**空切片是假值**；第 8 行是「转布尔」的常用写法。

## 返回值边界（实测）

| 输入 | 返回 | 是否报错 |
| --- | --- | --- |
| 任意真值（非空字符串、非零数、非空集合） | `false` | 否 |
| 任意假值（`false`、`0`、`""`、空切片 / 空映射） | `true` | 否 |
| 返回类型 | 恒为 `bool`（实测 `%T` → `bool`） | 否 |
| 不传参数 | —— | 是：`wrong number of args for not: want 1 got 0` |
