+++
title = "template"
linkTitle = "template"
description = "执行给定的模板，可选择传入上下文。"
date = 2026-10-02
weight = 140
source = "https://gohugo.io/functions/go-template/template/"

[params.functions_and_methods]
signatures = ["template NAME [CONTEXT]"]
+++

## 用法

用 `template` 语句执行一个已定义的模板：

```go-html-template
{{ template "foo" (dict "answer" 42) }}

{{ define "foo" }}
  {{ printf "The answer is %v." .answer }}
{{ end }}
```

上面的例子可以改写为使用内联 _局部模板_：

```go-html-template
{{ partial "inline/foo.html" (dict "answer" 42) }}

{{ define "_partials/inline/foo.html" }}
  {{ printf "The answer is %v." .answer }}
{{ end }}
```

上面两个例子的主要区别是：

1. 内联 _局部模板_ 的作用域是全局的。也就是说，在一个模板中定义的内联 _局部模板_ 可以从任何模板中调用。
1. 调用内联 _局部模板_ 时借助 [`partialCached`][] 函数，可以通过缓存结果来优化性能。
1. 内联 _局部模板_ 可以 [`return`][] 返回任意数据类型的值，而不只是渲染出字符串。

更多信息参见 Go 的 [`text/template`](https://pkg.go.dev/text/template) 文档。

[`partialCached`]: /functions/partials/includecached/
[`return`]: /functions/go-template/return/
