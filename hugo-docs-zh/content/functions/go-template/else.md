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
