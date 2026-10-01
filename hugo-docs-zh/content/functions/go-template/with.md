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
