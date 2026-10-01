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
