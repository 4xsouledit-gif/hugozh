+++
title = "with"
linkTitle = "with"
description = "若表达式为真值，则把上下文（点）绑定到该表达式并执行代码块。"
date = 2026-10-02
weight = 170
source = "https://gohugo.io/functions/go-template/with/"

[params.functions_and_methods]
signatures = ["with EXPR"]
+++

## 这一页解决什么问题

`with` 做两件事：**判断值是否为真值**，为真时**把上下文（点）绑定到该值**并执行块。它一次解决「判空」和「取值」两个问题，因此比 `if` 更常用。

理解 `with` 的关键是**上下文切换**：块内的 `.` 不再是页面对象，而是被绑定的那个值；要访问页面对象，用 `$`。

## 什么时候用，什么时候别用

**该用**：

- 字段可能存在也可能不存在：`{{ with .Params.author }}`；
- 资源可能取不到：`{{ with resources.Get "css/main.css" }}`；
- 需要绑定的值有多层：`{{ with .Params.cover }}{{ .RelPermalink }}{{ end }}`；
- 配合 `else` 做兜底、配合 `else with` 串多个候选值。

**别用**：

- 只需要布尔判断 → 用 [`if`](/functions/go-template/if/)（`with` 会顺带绑定上下文，改起来更麻烦）；
- 需要默认值 → 用 [`compare.Default`](/functions/compare/default/) 或 [`or`](/functions/go-template/or/)；
- 需要在 `range` 内保持外层上下文 → 用 `$`，而不是把 `with` 当作用域隔离手段。

## 关于真值与假值

假值包括 `false`、`0`、任何 `nil` 指针或接口值、任何长度为零的数组、切片、映射或字符串，以及零值 `time.Time`。

其余一切值都是真值。

## 用法

```go-html-template
{{ $var := "foo" }}
{{ with $var }}
  {{ . }} → foo
{{ end }}
```

与 [`else`][] 语句配合使用：

```go-html-template
{{ $var := "foo" }}
{{ with $var }}
  {{ . }} → foo
{{ else }}
  {{ print "var is falsy" }}
{{ end }}
```

用 `else with` 检查多个条件：

```go-html-template
{{ $v1 := 0 }}
{{ $v2 := 42 }}
{{ with $v1 }}
  {{ . }}
{{ else with $v2 }}
  {{ . }} → 42
{{ else }}
  {{ print "v1 and v2 are falsy" }}
{{ end }}
```

初始化一个变量，作用域限于当前代码块：

```go-html-template
{{ with $var := 42 }}
  {{ . }} → 42
  {{ $var }} → 42
{{ end }}
{{ $var }} → undefined
```

## 理解上下文

参见模板入门中的[上下文][context]一节。

例如在 _page_ 模板顶部，[上下文][context]（点）是一个 `Page` 对象。在 `with` 代码块内，上下文会绑定到传给 `with` 语句的值。

看这个刻意构造的例子：

```go-html-template
{{ with 42 }}
  {{ .Title }}
{{ end }}
```

Hugo 会抛出错误：

    can't evaluate field Title in type int

产生这个错误，是因为我们试图在整数上使用 `Title` 方法，而不是在 `Page` 对象上。在 `with` 代码块内，如果想渲染页面标题，就需要取到传入模板的上下文。

> [!NOTE]
> 用 `$` 取到传入模板的上下文。

下面这个模板就能按预期渲染出页面标题：

```go-html-template
{{ with 42 }}
  {{ $.Title }}
{{ end }}
```

> [!NOTE]
> 对任何编写模板代码的人来说，透彻理解上下文都至关重要。

更多信息参见 Go 的 [`text/template`](https://pkg.go.dev/text/template) 文档。

[`else`]: /functions/go-template/else/
[context]: /templates/introduction/#上下文

## 完整示例（实测）

`else with` 依次尝试候选值：

```go-html-template
{{ $v1 := 0 }}
{{ $v2 := 42 }}
{{ with $v1 }}
  {{ . }}
{{ else with $v2 }}
  {{ . }}
{{ else }}
  v1 and v2 are falsy
{{ end }}
```

Hugo 0.167.0 实测渲染为：

```text
42
```

块内初始化变量（作用域只在这个块里）：

```go-html-template
{{ with $var := 42 }}{{ . }}|{{ $var }}{{ end }}
```

Hugo 0.167.0 实测渲染为：

```text
42|42
```

在 `with` 块内回到模板顶层上下文：

```go-html-template
{{ with 42 }}{{ $.Title }}{{ end }}
```

Hugo 0.167.0 实测渲染为：

```text
Teach Test
```

（`Teach Test` 是实测站点的 `title`。）若写成 `{{ .Title }}`，则报错 `can't evaluate field Title in type int`（实测）。

## 返回值边界（实测）

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| 表达式为真值 | 执行块，`.` 绑定到该值 | 否 |
| 表达式为假值 | 跳过块；有 `else` / `else with` 时执行备用分支（实测 `$v1 := 0` 失败后 `else with $v2` 输出 `42`） | 否 |
| 块内初始化变量 | `{{ with $var := 42 }}{{ . }}\|{{ $var }}{{ end }}` 实测输出 `42\|42` | 否 |
| 块内访问错的字段 | —— | 是：`can't evaluate field Title in type int` |
| 返回类型 | 无（语句，不产生输出） | 否 |
