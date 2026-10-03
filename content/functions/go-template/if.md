+++
title = "if"
linkTitle = "if"
description = "当表达式为真值时执行该代码块。"
date = 2026-10-02
weight = 80
source = "https://gohugo.io/functions/go-template/if/"

[params.functions_and_methods]
signatures = ["if EXPR"]
+++

## 这一页解决什么问题

`if` 是模板里最基本的条件判断：表达式为真值时执行代码块，否则跳过（可交给 `else`）。判断依据是 Go 的**真值/假值**规则（见下一节），而不是「是否等于 true」——空字符串、`0`、空切片都会被当作假值。

## 什么时候用，什么时候别用

**该用**：

- 二选一，或需要多个互斥分支（`else if`）；
- 判断集合是否为空（`{{ if len .Pages }}`）；
- 在循环里对每个元素做条件渲染。

**别用**：

- 只是想「有值就渲染这个值」→ 用 [`with`](/functions/go-template/with/)，它会同时把「点」绑定到值上；
- 需要默认值 → 用 [`compare.Default`](/functions/compare/default/)，比 `if/else` 取值更短；
- 判断相等、大小 → 直接用 [`eq`](/functions/compare/eq/)、[`lt`](/functions/compare/lt/) 等比较函数；
- 三四种以上情况 → 考虑用映射（`dict` + `index`）代替层层 `else if`。

## 关于真值与假值

假值包括 `false`、`0`、任何 `nil` 指针或接口值、任何长度为零的数组、切片、映射或字符串，以及零值 `time.Time`。

其余一切值都是真值。

## 用法

```go-html-template
{{ $var := "foo" }}
{{ if $var }}
  {{ $var }} → foo
{{ end }}
```

与 [`else`][] 语句配合使用：

```go-html-template
{{ $var := "foo" }}
{{ if $var }}
  {{ $var }} → foo
{{ else }}
  {{ print "var is falsy" }}
{{ end }}
```

用 `else if` 检查多个条件：

```go-html-template
{{ $var := 12 }}
{{ if eq $var 6 }}
  {{ print "var is 6" }}
{{ else if eq $var 7 }}
  {{ print "var is 7" }}
{{ else if eq $var 42 }}
  {{ print "var is 42" }}
{{ else }}
  {{ print "var is something else" }}
{{ end }}
```

更多信息参见 Go 的 [`text/template`](https://pkg.go.dev/text/template) 文档。

[`else`]: /functions/go-template/else/

## 完整示例（实测）

真值走 `if`：

```go-html-template
{{ $var := "foo" }}
{{ if $var }}
  {{ $var }}
{{ else }}
  var is falsy
{{ end }}
```

Hugo 0.167.0 实测渲染为：

```text
foo
```

把 `$var` 改成空字符串 `""`（假值）后，输出变成 `var is falsy`。

多分支：

```go-html-template
{{ $var := 12 }}
{{ if eq $var 6 }}
  var is 6
{{ else if eq $var 7 }}
  var is 7
{{ else if eq $var 42 }}
  var is 42
{{ else }}
  var is something else
{{ end }}
```

Hugo 0.167.0 实测渲染为：

```text
var is something else
```

**你应当看到什么**：非空字符串是真值，走 `if` 分支；`12` 与 6/7/42 都不相等，落到最后的 `else`。

## 返回值边界（实测）

| 表达式 | 判定 | 是否报错 |
| --- | --- | --- |
| 非空字符串 `"foo"` | 真值 | 否 |
| 空字符串 `""` | 假值 | 否 |
| `0` | 假值（实测 `{{ not 0 }}` → `true`） | 否 |
| 空切片 `slice` | 假值（实测 `{{ not (slice) }}` → `true`） | 否 |
| 非空切片 / 映射 / 非零数字 | 真值 | 否 |
| 返回类型 | 无（语句，不产生输出） | 否 |
