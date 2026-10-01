+++
title = "compare.Default"
linkTitle = "compare.Default"
description = "如果第二个参数已设置则返回它，否则返回第一个参数。"
date = 2026-10-02
weight = 30
source = "https://gohugo.io/functions/compare/default/"

[params.functions_and_methods]
signatures = ["compare.Default DEFAULT INPUT"]
returnType = "any"
aliases = ["default"]
+++

## 用法

`compare.Default` 函数如果第二个参数已设置则返回第二个参数，否则返回第一个参数。

> [!NOTE]
> 当第二个参数是布尔值 `false` 时，`compare.Default` 函数返回 `false`。所有*其他*假值都被视为未设置。
>
> 假值包括 `false`、`0`、任何 `nil` 指针或接口值、任何长度为零的数组、切片、映射或字符串，以及零值 `time.Time`。
>
> 除此之外的一切都是真值。
>
> 若要基于真值性设置默认值，请改用 [`or`][] 运算符。

## 示例

第二个参数已设置时：

```go-html-template
{{ 1             | compare.Default 42 }} → 1
{{ "foo"         | compare.Default 42 }} → foo
{{ dict "k" "v"  | compare.Default 42 }} → map[k:v]
{{ slice "a" "b" | compare.Default 42 }} → [a b]
{{ true          | compare.Default 42 }} → true

<!-- As noted above, the boolean "false" is considered set -->
{{ false         | compare.Default 42 }} → false
```

第二个参数未设置时：

```go-html-template
{{ 0     | compare.Default 42 }} → 42
{{ ""    | compare.Default 42 }} → 42
{{ dict  | compare.Default 42 }} → 42
{{ slice | compare.Default 42 }} → 42

```

[`or`]: /functions/go-template/or/
