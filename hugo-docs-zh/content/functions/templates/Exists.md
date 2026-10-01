+++
title = "templates.Exists"
linkTitle = "Exists"
description = "报告相对于 `layouts` 目录的给定路径下是否存在模板文件。"
date = 2026-10-02
weight = 40
source = "https://gohugo.io/functions/templates/exists/"

[params.functions_and_methods]
signatures = ["templates.Exists PATH"]
returnType = "bool"
+++

模板文件是指项目自身或其任一主题组件 `layouts` 目录中的任何文件。

把 `templates.Exists` 函数用于动态模板路径：

```go-html-template
{{ $partialPath := printf "headers/%s.html" .Type }}
{{ if templates.Exists ( printf "_partials/%s" $partialPath ) }}
  {{ partial $partialPath . }}
{{ else }}
  {{ partial "headers/default.html" . }}
{{ end }}
```

在上例中，如果给定内容类型没有对应的 "headers" _partial_ 模板，Hugo 会回退到默认模板。
