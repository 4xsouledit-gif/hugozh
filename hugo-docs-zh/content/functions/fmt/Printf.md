+++
title = "fmt.Printf"
linkTitle = "fmt.Printf"
description = "返回按给定格式说明符格式化后的字符串。"
date = 2026-10-02
weight = 50
source = "https://gohugo.io/functions/fmt/printf/"

[params.functions_and_methods]
signatures = ["fmt.Printf FORMAT [INPUT]"]
returnType = "string"
aliases = ["printf"]
+++

Go 的 [`fmt`][] 包的文档描述了格式字符串的结构与内容。

[`fmt`]: https://pkg.go.dev/fmt

```go-html-template
{{ $var := "world" }}
{{ printf "Hello %s." $var }} → Hello world.
```

```go-html-template
{{ $pi := 3.14159265 }}
{{ printf "Pi is approximately %.2f." $pi }} → 3.14
```

把 `printf` 函数与 [`safe.HTMLAttr`][] 函数一起使用：

```go-html-template
{{ $desc := "Eat at Joe's" }}
<meta name="description" {{ printf "content=%q" $desc | safeHTMLAttr }}>
```

Hugo 会把它渲染为：

```html
<meta name="description" content="Eat at Joe's">
```

[`safe.HTMLAttr`]: /functions/safe/htmlattr/
