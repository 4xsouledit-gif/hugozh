+++
title = "AlternativeOutputFormats"
linkTitle = "AlternativeOutputFormats"
description = "返回 OutputFormat 对象切片，其中不含当前输出格式，每项代表该页面启用的一个输出格式。"
date = 2026-10-02
weight = 40
source = "https://gohugo.io/methods/page/alternativeoutputformats/"

[params.functions_and_methods]
signatures = ["PAGE.AlternativeOutputFormats"]
returnType = "page.OutputFormats"
+++

[输出格式（output format）](/quick-reference/glossary/output-format/)

`Page` 对象上的 `AlternativeOutputFormats` 方法返回一个 `OutputFormat` 对象切片，其中不包含当前输出格式，每一项代表给定页面启用的一个输出格式。详见[说明][]。

例如，为每个备选输出格式各生成一个 `link` 元素：

```go-html-template
{{ range .AlternativeOutputFormats }}
  {{ printf "<link rel=%q type=%q href=%q>" .Rel .MediaType.Type .Permalink | safeHTML }}
{{ end }}
```

Hugo 渲染出的结果大致如下：

```html
<link rel="alternate" type="application/rss+xml" href="https://example.org/index.xml">
<link rel="alternate" type="application/json" href="https://example.org/index.json">
```

[说明]: /configuration/output-formats/
