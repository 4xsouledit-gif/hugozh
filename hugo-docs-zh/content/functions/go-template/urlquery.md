+++
title = "urlquery"
linkTitle = "urlquery"
description = "返回其参数文本表示的转义结果，适合嵌入 URL 查询串。"
date = 2026-10-02
weight = 160
source = "https://gohugo.io/functions/go-template/urlquery/"

[params.functions_and_methods]
signatures = ["urlquery VALUE [VALUE...]"]
returnType = "string"
+++

## 用法

这段模板代码：

```go-html-template
{{ $u := urlquery "https://" "example.com" | safeURL }}
<a href="https://example.org?url={{ $u }}">Link</a>
```

渲染结果为：

```html
<a href="https://example.org?url=https%3A%2F%2Fexample.com">Link</a>
```

更多信息参见 Go 的 [`text/template`](https://pkg.go.dev/text/template) 文档。
