+++
title = "safe.HTML"
linkTitle = "HTML"
description = "返回被声明为安全 HTML 的给定字符串。"
date = 2026-10-02
weight = 30
source = "https://gohugo.io/functions/safe/html/"

[params.functions_and_methods]
signatures = ["safe.HTML INPUT"]
returnType = "template.HTML"
aliases = ["safeHTML"]
+++

## 简介

Hugo 使用 Go 的 [`text/template`][] 与 [`html/template`][] 包。

`text/template` 包实现数据驱动的模板，用于生成文本输出；`html/template` 包实现数据驱动的模板，用于生成可抵御代码注入的 HTML 输出。

默认情况下，Hugo 在渲染 HTML 文件时使用 `html/template` 包。

为了生成可抵御代码注入的 HTML 输出，`html/template` 包会在特定上下文中对字符串进行转义。

[`html/template`]: https://pkg.go.dev/html/template
[`text/template`]: https://pkg.go.dev/text/template

## 用法

使用 `safe.HTML` 函数封装已知安全的 HTML 文档片段。不要用它处理来自第三方的 HTML，也不要处理带有未闭合标签或注释的 HTML。

使用该类型会带来安全风险：封装的内容应当来自可信来源，因为它会被原样写入模板输出。

详情请参见 [Go 文档][Go documentation]。

## 示例

未做安全声明时：

```go-html-template
{{ $html := "<em>emphasized</em>" }}
{{ $html }}
```

Hugo 将上述代码渲染为：

```html
&lt;em&gt;emphasized&lt;/em&gt;
```

要把该字符串声明为安全：

```go-html-template
{{ $html := "<em>emphasized</em>" }}
{{ $html | safeHTML }}
```

Hugo 将上述代码渲染为：

```html
<em>emphasized</em>
```

[Go documentation]: https://pkg.go.dev/html/template#HTML
