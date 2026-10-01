+++
title = "continue"
linkTitle = "continue"
description = "终止最内层的 range 迭代，并继续执行下一次迭代。"
date = 2026-10-02
weight = 40
source = "https://gohugo.io/functions/go-template/continue/"

[params.functions_and_methods]
signatures = ["continue"]
+++

## 用法

这段模板代码：

```go-html-template
{{ $s := slice "foo" "bar" "baz" }}
{{ range $s }}
  {{ if eq . "bar" }}
    {{ continue }}
  {{ end }}
  <p>{{ . }}</p>
{{ end }}
```

渲染结果为：

```html
<p>foo</p>
<p>baz</p>
```

更多信息参见 Go 的 [`text/template`](https://pkg.go.dev/text/template) 文档。
