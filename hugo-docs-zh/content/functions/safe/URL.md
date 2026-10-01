+++
title = "safe.URL"
linkTitle = "URL"
description = "返回被声明为安全 URL 或 URL 子串的给定字符串。"
date = 2026-10-02
weight = 70
source = "https://gohugo.io/functions/safe/url/"

[params.functions_and_methods]
signatures = ["safe.URL INPUT"]
returnType = "template.URL"
aliases = ["safeURL"]
+++

## 简介

Hugo 使用 Go 的 [`text/template`][] 与 [`html/template`][] 包。

`text/template` 包实现数据驱动的模板，用于生成文本输出；`html/template` 包实现数据驱动的模板，用于生成可抵御代码注入的 HTML 输出。

默认情况下，Hugo 在渲染 HTML 文件时使用 `html/template` 包。

为了生成可抵御代码注入的 HTML 输出，`html/template` 包会在特定上下文中对字符串进行转义。

[`html/template`]: https://pkg.go.dev/html/template
[`text/template`]: https://pkg.go.dev/text/template

## 用法

使用 `safe.URL` 函数封装已知安全的 URL 或 URL 子串。除以下协议（scheme）之外都被视为不安全：

- `http:`
- `https:`
- `mailto:`

使用该类型会带来安全风险：封装的内容应当来自可信来源，因为它会被原样写入模板输出。

详情请参见 [Go 文档][Go documentation]。

## 示例

未做安全声明时：

```go-html-template
{{ $href := "irc://irc.freenode.net/#golang" }}
<a href="{{ $href }}">IRC</a>
```

Hugo 将上述代码渲染为：

```html
<a href="#ZgotmplZ">IRC</a>
```

> [!NOTE]
> `ZgotmplZ` 是一个特殊值，表示运行时有不安全的内容进入了 CSS 或 URL 上下文。

要把该字符串声明为安全：

```go-html-template
{{ $href := "irc://irc.freenode.net/#golang" }}
<a href="{{ $href | safeURL }}">IRC</a>
```

Hugo 将上述代码渲染为：

```html
<a href="irc://irc.freenode.net/#golang">IRC</a>
```

[Go documentation]: https://pkg.go.dev/html/template#URL
