+++
title = "ContentWithoutSummary"
linkTitle = "ContentWithoutSummary"
description = "返回给定页面渲染后的内容，但不含内容摘要。"
date = 2026-10-02
weight = 90
source = "https://gohugo.io/methods/page/contentwithoutsummary/"

[params.functions_and_methods]
signatures = ["PAGE.ContentWithoutSummary"]
returnType = "template.HTML"
+++

在使用手动或自动[内容摘要][]时，`Page` 对象上的 `ContentWithoutSummary` 方法会把 Markdown 与短代码渲染为 HTML，并在结果中剔除内容摘要。

如果你在前置元数据中定义内容摘要，`ContentWithoutSummary` 方法的返回值与 `Content` 相同。

```go-html-template
{{ .ContentWithoutSummary }}
```

[内容摘要]: /content-management/summaries/#manual-summary
