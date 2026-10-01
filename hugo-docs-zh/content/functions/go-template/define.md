+++
title = "define"
linkTitle = "define"
description = "定义一个模板。"
date = 2026-10-02
weight = 50
source = "https://gohugo.io/functions/go-template/define/"

[params.functions_and_methods]
signatures = ["define NAME"]
+++

## 用法

与 [`block`][] 语句配合使用：

```go-html-template
{{ block "main" . }}
  {{ print "default value if 'main' template is empty" }}
{{ end }}

{{ define "main" }}
  <h1>{{ .Title }}</h1>
  {{ .Content }}
{{ end }}
```

与 [`partial`][] 函数配合使用：

```go-html-template
{{ partial "inline/foo.html" (dict "answer" 42) }}

{{ define "_partials/inline/foo.html" }}
  {{ printf "The answer is %v." .answer }}
{{ end }}
```

与 [`template`][] 语句配合使用：

```go-html-template
{{ template "foo" (dict "answer" 42) }}

{{ define "foo" }}
  {{ printf "The answer is %v." .answer }}
{{ end }}
```

更多信息参见 Go 的 [`text/template`](https://pkg.go.dev/text/template) 文档。

[`block`]: /functions/go-template/block/
[`partial`]: /functions/partials/include/
[`template`]: /functions/go-template/block/
