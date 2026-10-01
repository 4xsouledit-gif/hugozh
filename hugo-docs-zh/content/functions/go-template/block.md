+++
title = "block"
linkTitle = "block"
description = "定义模板，并在当前位置执行它。"
date = 2026-10-02
weight = 20
source = "https://gohugo.io/functions/go-template/block/"

[params.functions_and_methods]
signatures = ["block NAME CONTEXT"]
+++

## 用法

`block` 是「定义模板」的简写：

```go-html-template
{{ define "name" }} T1 {{ end }}
```

随后在当前位置执行它：

```go-html-template
{{ template "name" pipeline }}
```

典型用法是先定义一组根模板，再通过重新定义其中的 block 模板来定制它们。

```go-html-template {file="layouts/baseof.html"}
<body>
  <main>
    {{ block "main" . }}
      {{ print "default value if 'main' template is empty" }}
    {{ end }}
  </main>
</body>
```

```go-html-template {file="layouts/page.html"}
{{ define "main" }}
  <h1>{{ .Title }}</h1>
  {{ .Content }}
{{ end }}
```

```go-html-template {file="layouts/section.html"}
{{ define "main" }}
  <h1>{{ .Title }}</h1>
  {{ .Content }}
  {{ range .Pages }}
    <h2><a href="{{ .RelPermalink }}">{{ .LinkTitle }}</a></h2>
  {{ end }}
{{ end }}
```

更多信息参见 Go 的 [`text/template`](https://pkg.go.dev/text/template) 文档。
