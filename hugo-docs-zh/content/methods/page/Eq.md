+++
title = "Eq"
linkTitle = "Eq"
description = "报告两个 Page 对象是否相等。"
date = 2026-10-02
weight = 150
source = "https://gohugo.io/methods/page/eq/"

[params.functions_and_methods]
signatures = ["PAGE1.Eq PAGE2"]
returnType = "bool"
+++

在这个刻意构造的例子中，我们列出当前 section 中除当前页面之外的所有页面。

```go-html-template {file="layouts/page.html"}
{{ $currentPage := . }}
{{ range .CurrentSection.Pages }}
  {{ if not (.Eq $currentPage) }}
    <a href="{{ .RelPermalink }}">{{ .LinkTitle }}</a>
  {{ end }}
{{ end }}
```
