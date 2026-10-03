+++
title = "else"
linkTitle = "else"
description = "为 if、with 与 range 语句开启一个备用分支。"
date = 2026-10-02
weight = 60
source = "https://gohugo.io/functions/go-template/else/"

[params.functions_and_methods]
signatures = ["else VALUE"]
+++

## 这一页解决什么问题

`else` 给 [`if`](/functions/go-template/if/)、[`with`](/functions/go-template/with/)、[`range`](/functions/go-template/range/) 提供「否则」分支：条件不成立、值为空、集合为空时执行它。它本身不产生输出，只是把控制流引到备用分支。

## 什么时候用，什么时候别用

**该用**：

- 判断结果要么 A 要么 B：`{{ if … }}A{{ else }}B{{ end }}`；
- `with` 绑定的值为空时给一个兜底：`{{ with .Params.image }}…{{ else }}没有图片{{ end }}`；
- `range` 遍历空集合时给出提示：`{{ range .Pages }}…{{ else }}暂无内容{{ end }}`；
- 多个互斥条件用 `else if` 串起来。

**别用**：

- 只需要「有值就渲染」→ [`with`](/functions/go-template/with/) 单用即可，不需要 `else`；
- 需要的是「默认值」（取值而不是分支）→ 用 [`compare.Default`](/functions/compare/default/)；
- 三四种以上情况 → 先用 `dict` + `index` 做映射，或拆成多个 `partial`，可读性更好。

## 用法

与 [`if`][] 语句配合使用：

```go-html-template
{{ $var := "foo" }}
{{ if $var }}
  {{ $var }} → foo
{{ else }}
  {{ print "var is falsy" }}
{{ end }}
```

与 [`with`][] 语句配合使用：

```go-html-template
{{ $var := "foo" }}
{{ with $var }}
  {{ . }} → foo
{{ else }}
  {{ print "var is falsy" }}
{{ end }}
```

与 [`range`][] 语句配合使用：

```go-html-template
{{ $var := slice 1 2 3 }}
{{ range $var }}
  {{ . }} → 1 2 3
{{ else }}
  {{ print "var is falsy" }}
{{ end }}
```

用 `else if` 检查多个条件。

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

[`if`]: /functions/go-template/if/
[`range`]: /functions/go-template/range/
[`with`]: /functions/go-template/with/

## 完整示例（实测）

空集合走 `else`：

```go-html-template
{{ $s := slice }}
{{ range $s }}
  <p>{{ . }}</p>
{{ else }}
  <p>The collection is empty</p>
{{ end }}
```

Hugo 0.167.0 实测渲染为：

```html
<p>The collection is empty</p>
```

多分支的 `else if`：

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

**你应当看到什么**：空切片走 `else`；`12` 不等于 6/7/42，因此落到最后的 `else`。

## 返回值边界（实测）

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| `if` 条件为假值 | 执行 `else` 分支（实测 `12` 一路落到最后 `else`） | 否 |
| `with` 绑定值为假值 | 执行 `else` / `else with` 分支（实测 `$v1 := 0` 失败后 `else with $v2` 输出 `42`） | 否 |
| `range` 集合为空 | 执行 `else` 分支（实测输出 `<p>The collection is empty</p>`） | 否 |
| 前面的分支已成立 | 后续 `else` 分支全部跳过（实测 `if` 成立时只输出 `foo`） | 否 |
| 返回类型 | 无（语句，不产生模板输出） | 否 |
