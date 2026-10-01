+++
title = "end"
linkTitle = "end"
description = "结束 if、with、range、block 与 define 语句。"
date = 2026-10-02
weight = 70
source = "https://gohugo.io/functions/go-template/end/"

[params.functions_and_methods]
signatures = ["end"]
+++

## 用法

与 [`if`][] 语句配合使用：

```go-html-template
{{ $var := "foo" }}
{{ if $var }}
  {{ $var }} → foo
{{ end }}
```

与 [`with`][] 语句配合使用：

```go-html-template
{{ $var := "foo" }}
{{ with $var }}
  {{ . }} → foo
{{ end }}
```

与 [`range`][] 语句配合使用：

```go-html-template
{{ $var := slice 1 2 3 }}
{{ range $var }}
  {{ . }} → 1 2 3
{{ end }}
```

与 [`block`][] 语句配合使用：

```go-html-template
{{ block "main" . }}{{ end }}
```

与 [`define`][] 语句配合使用：

```go-html-template
{{ define "main" }}
  {{ print "this is the main section" }}
{{ end }}
```

更多信息参见 Go 的 [`text/template`](https://pkg.go.dev/text/template) 文档。

[`block`]: /functions/go-template/block/
[`define`]: /functions/go-template/define/
[`if`]: /functions/go-template/if/
[`range`]: /functions/go-template/range/
[`with`]: /functions/go-template/with/
