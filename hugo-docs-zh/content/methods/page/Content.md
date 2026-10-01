+++
title = "Content"
linkTitle = "Content"
description = "返回给定页面渲染后的内容。"
date = 2026-10-02
weight = 80
source = "https://gohugo.io/methods/page/content/"

[params.functions_and_methods]
signatures = ["PAGE.Content"]
returnType = "template.HTML"
+++

`Page` 对象上的 `Content` 方法把 Markdown 与短代码（shortcode）渲染为 HTML。

```go-html-template
{{ .Content }}
```
