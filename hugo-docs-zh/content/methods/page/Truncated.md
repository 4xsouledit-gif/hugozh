+++
title = "Truncated"
linkTitle = "Truncated"
description = "报告内容长度是否超过摘要长度。"
date = 2026-10-02
weight = 860
source = "https://gohugo.io/methods/page/truncated/"

[params.functions_and_methods]
signatures = ["PAGE.Truncated"]
returnType = "bool"
+++

你可以手动定义[摘要][]，也可以在前置元数据中定义，或者让它自动生成。手动摘要优先于前置元数据摘要，前置元数据摘要优先于自动摘要。

如果内容长度超过摘要长度，`Truncated` 方法返回 `true`。这在需要有条件地渲染“阅读更多”链接时很有用：

```go-html-template
{{ range .Pages }}
  <h2><a href="{{ .RelPermalink }}">{{ .LinkTitle }}</a></h2>
  {{ .Summary }}
  {{ if .Truncated }}
    <a href="{{ .RelPermalink }}">Read more...</a>
  {{ end }}
{{ end }}
```

> [!NOTE]
> 如果你在前置元数据中定义摘要，`Truncated` 方法会返回 `false`。

[summary]: /content-management/summaries/
