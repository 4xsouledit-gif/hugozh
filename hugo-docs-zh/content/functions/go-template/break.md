+++
title = "break"
linkTitle = "break"
description = "终止最内层的 range 迭代，并跳过其余所有迭代。"
date = 2026-10-02
weight = 30
source = "https://gohugo.io/functions/go-template/break/"

[params.functions_and_methods]
signatures = ["break"]
+++

## 用法

这段模板代码：

```go-html-template
{{ $s := slice "foo" "bar" "baz" }}
{{ range $s }}
  {{ if eq . "bar" }}
    {{ break }}
  {{ end }}
  <p>{{ . }}</p>
{{ end }}
```

渲染结果为：

```html
<p>foo</p>
```

更多信息参见 Go 的 [`text/template`](https://pkg.go.dev/text/template) 文档。
